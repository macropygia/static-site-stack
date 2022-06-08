import os from 'os'
import path from 'path'

import fse from 'fs-extra'
import pLimit, { LimitFunction } from 'p-limit'
import ansis from 'ansis'
import { createLogger } from 'vite'
import type { Plugin, ResolvedConfig } from 'vite'
import type Rollup from 'rollup'
import type Picomatch from 'picomatch'
import picomatch from 'picomatch'
import fg from 'fast-glob'
import { crc32 } from 'polycrc'

import type { Settings, ImageminSettings } from './types'
import { processor } from './processor'
import { CacheDb } from './db'

const logger = createLogger()

const defaultSettings: Settings = {
  cacheDir: 'node_modules/.imagemin',
  expireDuration: 10 * 24 * 60 * 60, // 10 days
  countToExpire: 10,
  concurrency: os.cpus().length,
  plugins: {},
}

function initExcludeMatcher(pattern?: Picomatch.Glob | Picomatch.Matcher) {
  if (pattern === undefined) return null
  if (typeof pattern === 'string' || Array.isArray(pattern))
    return picomatch(pattern)
  return pattern
}

const vitePluginImageminCache = (userSettings?: Partial<Settings>): Plugin => {
  // Merge settings
  const settings: Settings = {
    ...defaultSettings,
    ...userSettings,
  }
  const imageminSettings: ImageminSettings = settings.plugins

  // Init Picomatch matcher for excluding
  const shouldExclude: Picomatch.Matcher | null = initExcludeMatcher(
    settings.exclude
  )

  // Init compressing queue
  const limit: LimitFunction = pLimit(settings.concurrency)

  // Init list of extensions for file filtering
  const targetExtentions: Set<string> = new Set()
  if (imageminSettings.pngquant !== false) targetExtentions.add('.png')
  if (imageminSettings.optipng !== false) targetExtentions.add('.png')
  if (imageminSettings.mozjpeg !== false)
    targetExtentions.add('.jpg').add('.jpeg')
  if (imageminSettings.svgo !== false) targetExtentions.add('.svg')
  // if (imageminSettings.webp !== false) targetExtentions.add('.webp')

  // Init variables used in multiple hooks
  let config: ResolvedConfig
  // let rootDir: string
  let outDir: string
  let pubDir: string | null

  // Init cache directory
  const cacheDir = path.normalize(settings.cacheDir)
  fse.ensureDirSync(cacheDir)

  // Init cache db
  const cacheDb = new CacheDb(
    path.join(cacheDir, 'cache.db'),
    settings.expireDuration,
    settings.countToExpire
  )

  // バンドルの対象ファイルSet初期化
  // generateBundleで取得するがcloseBundleでも使用するため
  const bundleTargets: Set<string> = new Set()

  return {
    name: 'vite-plugin-imagemin-cache',
    enforce: 'post',
    apply: 'build',
    configResolved(resolvedConfig: ResolvedConfig) {
      config = resolvedConfig
      // rootDir = config.root
      outDir = config.build.outDir
      pubDir = typeof config.publicDir === 'string' ? config.publicDir : null
    },
    async generateBundle(_options, bundle: Rollup.OutputBundle) {
      // Get target files in the bundle
      for (const [key, asset] of Object.entries(bundle)) {
        // Asset only
        if (asset.type !== 'asset' || !asset.name) continue
        // Plugin specified filetype only
        if (targetExtentions.has(path.extname(key))) {
          // Excluding
          if (shouldExclude && shouldExclude(asset.name)) {
            continue
          }
          bundleTargets.add(key)
        }
      }

      // Nothing to do
      if (bundleTargets.size === 0) return

      logger.info('') // Preserve new line
      logger.info(
        ansis.cyanBright('[vite-plugin-imagemin-cache] ') +
          ansis.green('processing bundle...')
      )

      // Add files to compressing queue
      const queue = [...bundleTargets].map(async (fileName) => {
        return limit(async () => {
          const cachePath = path.join(cacheDir, fileName)

          // Use cache if it exists
          if (fse.existsSync(cachePath)) {
            ;(bundle[fileName] as Rollup.OutputAsset).source =
              await fse.readFile(cachePath)
            logger.info(
              ansis.cyanBright('[vite-plugin-imagemin-cache] ') +
                ansis.green('cache hit: ') +
                ansis.yellow(fileName)
            )
            return
          }

          // 事前に `asset.type !== 'asset'` で絞り込んでいるため
          // `bundle[fileName]` は必ず `Rollup.OutputAsset` になる
          const source = <Buffer>(bundle[fileName] as Rollup.OutputAsset).source

          // imagemin
          const content = await processor(imageminSettings, source)
          if (content === false) {
            logger.error(
              ansis.cyanBright('[vite-plugin-imagemin-cache] ') +
                ansis.green('imagemin error: ') +
                ansis.yellow(fileName)
            )
            throw new Error('imagemin failed')
          } else {
            ;(bundle[fileName] as Rollup.OutputAsset).source = content
            await fse.outputFile(cachePath, content)
          }
          logger.info(
            ansis.cyanBright('[vite-plugin-imagemin-cache] ') +
              ansis.green('compressed: ') +
              ansis.yellow(fileName) +
              ansis.dim(' (processing: ') +
              ansis.dim(limit.activeCount.toString()) +
              ansis.dim(', pending: ') +
              ansis.dim(limit.pendingCount.toString()) +
              ansis.dim(')'),
            {
              clear: false,
            }
          )
        })
      })

      await Promise.all(queue)
    },
    async closeBundle() {
      const staticMap: Map<string, number> = new Map()

      if (pubDir) {
        const publicDir: string = pubDir // Type issue

        logger.info(
          ansis.cyanBright('[vite-plugin-imagemin-cache] ') +
            ansis.green('processing public files...')
        )

        const fgResults = fg.sync(
          [...targetExtentions].map(
            (ext) =>
              `${path
                .relative(process.cwd(), publicDir)
                .replaceAll(path.sep, '/')}/**/*${ext}`
          )
        )

        // Convert cwd relative path to root relative path
        const staticTargets: Set<string> = new Set(
          fgResults.map((relPath) =>
            path.relative(publicDir, path.join(process.cwd(), relPath))
          )
        )

        // Add files to compressing queue
        const queue = [...staticTargets].map(async (fileName) => {
          return limit(async () => {
            if (shouldExclude && shouldExclude(fileName)) return

            const srcPath = path.join(publicDir, fileName)

            if (!fse.existsSync(srcPath))
              throw new Error(`File not found: ${fileName}`)

            const cachePath = path.resolve(path.join(cacheDir, fileName))
            const destPath = path.join(outDir, fileName)

            const source = fse.readFileSync(srcPath)
            const checksum: number = crc32(source)
            staticMap.set(fileName, checksum) // for db operation

            const data = cacheDb.getData(fileName)

            if (
              !data || // Data does not exists
              data.checksum !== checksum || // Checksum does not match
              !fse.existsSync(cachePath) // Cache file does not exists
            ) {
              // Run imagemin
              const content = await processor(imageminSettings, source)
              if (content === false) {
                logger.error(
                  ansis.cyanBright('[vite-plugin-imagemin-cache] ') +
                    ansis.green('imagemin error: ') +
                    ansis.yellow(fileName)
                )
                throw new Error(`imagemin failed: ${fileName}`)
              } else {
                await Promise.all([
                  fse.outputFile(cachePath, content),
                  fse.outputFile(destPath, content),
                ])
              }
              logger.info(
                ansis.cyanBright('[vite-plugin-imagemin-cache] ') +
                  ansis.green('compressed: ') +
                  ansis.yellow(fileName) +
                  ansis.dim(' (processing: ') +
                  ansis.dim(limit.activeCount.toString()) +
                  ansis.dim(', pending: ') +
                  ansis.dim(limit.pendingCount.toString()) +
                  ansis.dim(')'),
                {
                  clear: false,
                }
              )
            } else {
              // CRCが一致するキャッシュがあればコピー
              fse.copyFileSync(cachePath, destPath)
              logger.info(
                ansis.cyanBright('[vite-plugin-imagemin-cache] ') +
                  ansis.green('cache hit: ') +
                  ansis.yellow(fileName)
              )
              return
            }
          })
        })
        await Promise.all(queue)
      }

      // Cache database operations
      const now = new Date().getTime()

      cacheDb.countdown()

      cacheDb.renewBundle(bundleTargets, now)
      cacheDb.insertBundle(bundleTargets, now)

      for (const [fileName, checksum] of staticMap) {
        cacheDb.upsertStatic(fileName, checksum, now)
      }

      // Delete expired cache files
      const expiredFiles = cacheDb.getExpired(now)
      await Promise.all(
        expiredFiles.map((file): Promise<void> => {
          return fse.remove(path.join(cacheDir, file.fileName))
        })
      )
      cacheDb.removeExpired(now)

      cacheDb.close()
    },
  }
}

export default vitePluginImageminCache

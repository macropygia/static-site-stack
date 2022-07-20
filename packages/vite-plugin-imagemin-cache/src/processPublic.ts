import path from 'path'

import fse from 'fs-extra'
import fg from 'fast-glob'
import { crc32 } from 'polycrc'
import type { ResolvedConfig } from 'vite'
import ansis from 'ansis'

import type { Context } from './types.js'
import { imageProcessor } from './imageProcessor.js'

export async function processPublic(ctx: Context, viteConfig: ResolvedConfig) {
  const { config } = ctx
  const outDir = viteConfig.build.outDir

  const fgResults = fg.sync(
    [...ctx.targetExtentions].map(
      (ext) =>
        `${path
          .relative(process.cwd(), ctx.publicDir)
          .replaceAll(path.sep, '/')}/**/*${ext}`
    )
  )

  // Convert cwd relative path to root relative path
  ctx.publicTargets = new Set(
    fgResults.flatMap((relPath) => {
      const fileName = path.relative(
        ctx.publicDir,
        path.join(process.cwd(), relPath)
      )
      if (ctx.excludeMatcher && ctx.excludeMatcher(fileName)) return []
      return fileName
    })
  )

  // Add files to compressing queue
  const queue = [...ctx.publicTargets].map(async (fileName) => {
    return ctx.limit(async () => {
      const srcPath = path.join(ctx.publicDir, fileName)

      if (!fse.existsSync(srcPath))
        throw new Error(`File not found: ${fileName}`)

      const cachePath = path.resolve(path.join(config.cacheDir, fileName))
      const destPath = path.join(outDir, fileName)

      // Calculate CRC32
      const source = fse.readFileSync(srcPath)
      const checksum: number = crc32(source)

      // for cache database
      ctx.publicHashMap.set(fileName, checksum)

      const cacheData = ctx.cacheDb.getData(fileName)

      if (
        cacheData && // Data exists
        cacheData.checksum === checksum && // Checksum match
        fse.existsSync(cachePath) // File exists
      ) {
        // CRCが一致するキャッシュがあればコピー
        fse.copySync(cachePath, destPath)
        ctx.logger.info(
          ansis.cyanBright('[imagemin-cache] ') +
            ansis.green('cache hit: ') +
            ansis.yellow(fileName)
        )
        return
      } else {
        // Run imagemin
        const content = await imageProcessor(config.plugins, source)
        if (content === false) {
          ctx.logger.error(
            ansis.cyanBright('[imagemin-cache] ') +
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
        ctx.logger.info(
          ansis.cyanBright('[imagemin-cache] ') +
            ansis.green('compressed: ') +
            ansis.yellow(fileName) +
            ansis.dim(
              ` (processing: ${ctx.limit.activeCount.toString()}, pending: ${ctx.limit.pendingCount.toString()})`
            ),
          {
            clear: false,
          }
        )
      }
    })
  })
  await Promise.all(queue)

  // 対象拡張子以外のファイルをコピー
  if (config.public.preventDefault) {
    fse.copySync(ctx.publicDir, viteConfig.build.outDir, {
      filter: (filepath) =>
        ctx.targetExtentions.has(path.extname(filepath)) ? false : true,
    })
  }
}

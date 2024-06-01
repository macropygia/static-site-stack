import path from 'node:path'

import fse from 'fs-extra'
import fg from 'fast-glob'
import { crc32 } from 'polycrc'
import type { ResolvedConfig } from 'vite'

import type { Context } from './types.js'
import { imageProcessor } from './imageProcessor.js'

const getTargets = (ctx: Context): Set<string> => {
  const fgResults = fg.sync(
    [...ctx.targetExtentions].map(
      (ext) =>
        `${path
          .relative(process.cwd(), ctx.publicDir)
          .replaceAll(path.sep, '/')}/**/*${ext}`,
    ),
  )
  // Convert cwd relative path to root relative path
  return new Set(
    fgResults.flatMap((relPath) => {
      const fileName = path.relative(
        ctx.publicDir,
        path.join(process.cwd(), relPath),
      )
      if (ctx.excludeMatcher && ctx.excludeMatcher(fileName)) return []
      return fileName
    }),
  )
}

export async function processPublic(ctx: Context, viteConfig: ResolvedConfig) {
  const { config } = ctx
  const outDir = viteConfig.build.outDir

  ctx.publicTargets = getTargets(ctx)

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

      // Copy from cache
      if (
        cacheData && // Data exists
        cacheData.checksum === checksum && // Checksum match
        fse.existsSync(cachePath) // File exists
      ) {
        fse.copySync(cachePath, destPath)
        ctx.outputLog('info', 'cache hit:', fileName)
        return
      }

      // Run imagemin
      const content = await imageProcessor(config.plugins, source)
      if (content === false) {
        ctx.outputLog('error', 'imagemin error:', fileName)
        throw new Error(`imagemin failed: ${fileName}`)
      } else {
        await Promise.all([
          fse.outputFile(cachePath, content),
          fse.outputFile(destPath, content),
        ])
      }
      ctx.outputLog(
        'info',
        'compressed:',
        fileName,
        `(processing: ${ctx.limit.activeCount.toString()}, pending: ${ctx.limit.pendingCount.toString()})`,
      )
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

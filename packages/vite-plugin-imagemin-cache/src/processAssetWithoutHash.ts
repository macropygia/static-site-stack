import path from 'path'

import fse from 'fs-extra'
import type Rollup from 'rollup'
import { crc32 } from 'polycrc'

import type { Context } from './types.js'
import { imageProcessor } from './imageProcessor.js'

export async function processAssetWithoutHash(
  ctx: Context,
  bundle: Rollup.OutputBundle
) {
  // Add files to compressing queue
  const queue = [...ctx.assetTargets].map(async (fileName) => {
    const { config } = ctx

    return ctx.limit(async () => {
      const cachePath = path.resolve(path.join(config.cacheDir, fileName))

      // Calculate CRC32
      const source = <Buffer>(bundle[fileName] as Rollup.OutputAsset).source
      const checksum: number = crc32(source)

      // for cache database
      ctx.assetHashMap.set(fileName, checksum)

      const cacheData = ctx.cacheDb.getData(fileName)

      if (
        cacheData && // Data exists
        cacheData.checksum === checksum && // Checksum match
        fse.existsSync(cachePath) // File exists
      ) {
        ;(bundle[fileName] as Rollup.OutputAsset).source = await fse.readFile(
          cachePath
        )
        ctx.outputLog('info', 'cache hit:', fileName)
        return
      } else {
        // Run imagemin
        const content = await imageProcessor(config.plugins, source)
        if (content === false) {
          ctx.outputLog('error', 'imagemin error:', fileName)
          throw new Error(`imagemin failed: ${fileName}`)
        } else {
          ;(bundle[fileName] as Rollup.OutputAsset).source = content
          await fse.outputFile(cachePath, content)
        }
        ctx.outputLog(
          'info',
          'compressed:',
          fileName,
          `(processing: ${ctx.limit.activeCount.toString()}, pending: ${ctx.limit.pendingCount.toString()})`
        )
      }
    })
  })

  await Promise.all(queue)
}

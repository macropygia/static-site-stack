import path from 'path'

import fse from 'fs-extra'
import type Rollup from 'rollup'
import type { ResolvedConfig } from 'vite'
import ansis from 'ansis'

import type { Context } from './types.js'
import { imageProcessor } from './imageProcessor.js'

export async function processAsset(
  ctx: Context,
  viteConfig: ResolvedConfig,
  bundle: Rollup.OutputBundle
) {
  // Add files to compressing queue
  const queue = [...ctx.assetTargets].map(async (fileName) => {
    const { config } = ctx
    const outDir = viteConfig.build.outDir

    return ctx.limit(async () => {
      const cachePath = path.resolve(path.join(config.cacheDir, fileName))

      // Skip generation
      if (
        config.asset.preventOverwrite &&
        fse.existsSync(path.join(outDir, fileName))
      ) {
        delete bundle[fileName]
        ctx.logger.info(
          ansis.cyanBright('[imagemin-cache] ') +
            ansis.green('skip: ') +
            ansis.yellow(fileName)
        )
        return
      }

      // Use cache if it exists
      if (fse.existsSync(cachePath)) {
        ;(bundle[fileName] as Rollup.OutputAsset).source = await fse.readFile(
          cachePath
        )
        ctx.logger.info(
          ansis.cyanBright('[imagemin-cache] ') +
            ansis.green('cache hit: ') +
            ansis.yellow(fileName)
        )
        return
      }

      // 事前に `asset.type !== 'asset'` で絞り込んでいるため
      // `bundle[fileName]` は必ず `Rollup.OutputAsset` になる
      const source = <Buffer>(bundle[fileName] as Rollup.OutputAsset).source

      // imagemin
      const content = await imageProcessor(config.plugins, source)
      if (content === false) {
        ctx.logger.error(
          ansis.cyanBright('[imagemin-cache] ') +
            ansis.green('imagemin error: ') +
            ansis.yellow(fileName)
        )
        throw new Error('imagemin failed')
      } else {
        ;(bundle[fileName] as Rollup.OutputAsset).source = content
        await fse.outputFile(cachePath, content)
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
    })
  })

  await Promise.all(queue)
}

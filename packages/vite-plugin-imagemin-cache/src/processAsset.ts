import path from 'node:path'

import fse from 'fs-extra'
import type Rollup from 'rollup'
import type { ResolvedConfig } from 'vite'

import type { Context } from './types.js'
import { imageProcessor } from './imageProcessor.js'

export async function processAsset(
  ctx: Context,
  viteConfig: ResolvedConfig,
  bundle: Rollup.OutputBundle,
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

        ctx.outputLog('info', 'skip:', fileName)
        return
      }

      // Use cache if it exists
      if (fse.existsSync(cachePath)) {
        ;(bundle[fileName] as Rollup.OutputAsset).source =
          await fse.readFile(cachePath)
        ctx.outputLog('info', 'cache hit:', fileName)
        return
      }

      // 事前に `asset.type !== 'asset'` で絞り込んでいるため
      // `bundle[fileName]` は必ず `Rollup.OutputAsset` になる
      const source = <Buffer>(bundle[fileName] as Rollup.OutputAsset).source

      // imagemin
      const content = await imageProcessor(config.plugins, source)
      if (content === false) {
        ctx.outputLog('error', 'imagemin error:', fileName)
        throw new Error('imagemin failed')
      } else {
        ;(bundle[fileName] as Rollup.OutputAsset).source = content
        await fse.outputFile(cachePath, content)
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
}

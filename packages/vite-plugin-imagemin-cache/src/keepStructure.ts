import path from 'node:path'

import type { UserConfig } from 'vite'
import type Rollup from 'rollup'

import { getResolvedRoot, normalizePath } from './utils.js'
import type { Context } from './types.js'

export function setupRollupOptionsForKeepStructure(
  ctx: Context,
  config: UserConfig,
): UserConfig {
  const root = getResolvedRoot(config.root)
  let defaultAssetFileNames = 'assets/[name].[hash].[ext]' // Same as Vite

  // Get assetFileNames from vite.config.ts if exists
  if (
    config.build?.rollupOptions?.output &&
    !Array.isArray(config.build.rollupOptions.output) &&
    typeof config.build.rollupOptions.output.assetFileNames === 'string'
  )
    defaultAssetFileNames = config.build.rollupOptions.output.assetFileNames

  const overrideConfig = {
    build: {
      rollupOptions: {
        output: {
          assetFileNames: (assetInfo: Rollup.PreRenderedAsset) => {
            if (!assetInfo.name) return defaultAssetFileNames
            if (ctx.targetExtentions.has(path.extname(assetInfo.name))) {
              const rel = path.relative(root, assetInfo.name)
              const assetFileName =
                path.dirname(rel) === '.'
                  ? '[name].[ext]'
                  : `${path.dirname(rel)}/[name].[ext]`
              return normalizePath(assetFileName)
            }
            return defaultAssetFileNames
          },
        },
      },
    },
  }
  return {
    ...config,
    ...overrideConfig,
  }
}

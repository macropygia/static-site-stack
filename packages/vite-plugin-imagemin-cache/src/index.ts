import path from 'node:path'

import fse from 'fs-extra'
import type { Plugin, ResolvedConfig } from 'vite'
import type Rollup from 'rollup'

import type { UserSettings } from './types.js'
import {
  initConfig,
  initContext,
  updateConfig,
  updateViteUserConfig,
} from './config.js'
import { cachebuster } from './cachebuster.js'
import { processAsset } from './processAsset.js'
import { processAssetWithoutHash } from './processAssetWithoutHash.js'
import { processPublic } from './processPublic.js'
import { processCache } from './processCache.js'

const vitePluginImageminCache = (userSettings?: UserSettings): Plugin => {
  const config = initConfig(userSettings || {})
  const ctx = initContext(config)
  let viteConfig: ResolvedConfig

  fse.ensureDirSync(config.cacheDir)

  return {
    name: 'vite-plugin-imagemin-cache',
    enforce: 'post',
    apply: 'build',
    config(viteUserConfig) {
      return updateViteUserConfig(ctx, config, viteUserConfig)
    },
    configResolved(resolvedConfig: ResolvedConfig) {
      viteConfig = resolvedConfig
      updateConfig(config, viteConfig)
    },
    transformIndexHtml(html) {
      // Cachebuster for static assets
      if (config.asset.cachebuster)
        return cachebuster(html, config.asset.cachebuster)
      return html
    },
    async generateBundle(_options, bundle: Rollup.OutputBundle) {
      // Get target files in the bundle
      Object.entries(bundle).forEach(([fileName, asset]) => {
        if (
          asset.type !== 'asset' || // Asset only
          !asset.name || // File only
          !ctx.targetExtentions.has(path.extname(fileName)) || // Plugin specified filetype only
          (ctx.excludeMatcher && ctx.excludeMatcher(asset.name)) // Excluding
        )
          return
        ctx.assetTargets.add(fileName)
      })

      // Nothing to do
      if (ctx.assetTargets.size === 0) return

      console.log('') // Preserve new line
      ctx.outputLog('info', 'processing static asset...')

      if (config.asset.useCrc) await processAssetWithoutHash(ctx, bundle)
      else await processAsset(ctx, viteConfig, bundle)
    },
    async closeBundle() {
      if (ctx.publicDir !== '') {
        ctx.outputLog('info', 'processing public directory...')

        await processPublic(ctx, viteConfig)
      }

      // Cache database operations
      const now = new Date().getTime()

      await processCache(ctx, now)
    },
  }
}

export default vitePluginImageminCache

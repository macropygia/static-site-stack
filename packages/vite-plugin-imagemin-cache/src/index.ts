import path from 'path'

import fse from 'fs-extra'
import type { Plugin, ResolvedConfig } from 'vite'
import type Rollup from 'rollup'

import type { UserSettings } from './types.js'
import { initConfig, initContext } from './config.js'
import { getResolvedRoot, getResolvedPublicDir } from './utils.js'
import { setupRollupOptionsForKeepStructure } from './keepStructure.js'
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
      const root = getResolvedRoot(viteUserConfig.root)
      ctx.publicDir = getResolvedPublicDir(viteUserConfig.publicDir, root)

      // Prevent Vite default copy function for public directory
      if (config.public.preventDefault) viteUserConfig.publicDir = false

      if (config.asset.keepStructure) {
        config.asset.preventOverwrite = false
        return setupRollupOptionsForKeepStructure(ctx, viteUserConfig)
      }
      return
    },
    configResolved(resolvedConfig: ResolvedConfig) {
      viteConfig = resolvedConfig

      // Determine if `useCRC` should be used
      if (Array.isArray(viteConfig.build.rollupOptions.output)) {
        // If output is an array, set `true`
        config.asset.useCrc = true
      } else if (
        viteConfig.build.rollupOptions.output?.assetFileNames &&
        typeof viteConfig.build.rollupOptions.output.assetFileNames ===
          'string' &&
        !viteConfig.build.rollupOptions.output.assetFileNames.includes('[hash]')
      ) {
        // If assetFileNames is a string and doesn't contain [hash], set `true`
        config.asset.useCrc = true
      }
      // If keepStructure is `true`, set `true`
      if (config.asset.keepStructure) config.asset.useCrc = true

      // Force overwrite when emptyOutDir is true
      if (viteConfig.build.emptyOutDir) {
        config.asset.preventOverwrite = false
        config.public.preventOverwrite = false
      }
    },
    transformIndexHtml(html) {
      // Cachebuster for static assets
      if (config.asset.cachebuster)
        return cachebuster(html, config.asset.cachebuster)
      return html
    },
    async generateBundle(_options, bundle: Rollup.OutputBundle) {
      // Get target files in the bundle
      for (const [fileName, asset] of Object.entries(bundle)) {
        // Asset only
        if (asset.type !== 'asset' || !asset.name) continue
        // Plugin specified filetype only
        if (ctx.targetExtentions.has(path.extname(fileName))) {
          // Excluding
          if (ctx.excludeMatcher && ctx.excludeMatcher(asset.name)) continue
          ctx.assetTargets.add(fileName)
        }
      }

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

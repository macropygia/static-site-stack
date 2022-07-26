import os from 'node:os'
import path from 'node:path'

import pLimit from 'p-limit'
import type { ResolvedConfig, UserConfig } from 'vite'

import type {
  AssetSettings,
  PublicSettings,
  UserSettings,
  Settings,
  Context,
} from './types.js'
import {
  initMatcher,
  outputLog,
  getResolvedRoot,
  getResolvedPublicDir,
} from './utils.js'
import { CacheDb } from './db.js'
import { setupRollupOptionsForKeepStructure } from './keepStructure.js'

const defaultSettings: Omit<Settings, 'asset' | 'public'> = {
  cacheDir: 'node_modules/.imagemin',
  expireDuration: 10 * 24 * 60 * 60, // 10 days
  countToExpire: 10,
  concurrency: os.cpus().length,
  // exclude
  plugins: {},
  // asset
  // public
}

const defaultAssetSettings: AssetSettings = {
  keepStructure: false,
  cachebuster: false,
  useCrc: false,
  preventOverwrite: false,
}

const defaultPublicSettings: PublicSettings = {
  preventDefault: false,
  preventOverwrite: false,
}

export function initConfig(userSettings: UserSettings): Settings {
  const settings: Settings = {
    ...defaultSettings,
    ...userSettings,
    asset: { ...defaultAssetSettings, ...userSettings.asset },
    public: { ...defaultPublicSettings, ...userSettings.public },
  }

  settings.cacheDir = path.normalize(settings.cacheDir)

  return settings
}

export function initContext(config: Settings): Context {
  const ctx: Context = {
    config,
    outputLog,
    // resolvedPublicDir for preventDefault
    publicDir: '',
    // Compressing queue
    limit: pLimit(config.concurrency),
    cacheDb: new CacheDb(
      path.join(config.cacheDir, 'cache.db'),
      config.expireDuration,
      config.countToExpire
    ),
    excludeMatcher: initMatcher(config.exclude),
    targetExtentions: new Set(),
    assetTargets: new Set(),
    assetHashMap: new Map(),
    publicTargets: new Set(),
    publicHashMap: new Map(),
  }

  // Init list of extensions for file filtering
  if (config.plugins.pngquant !== false) ctx.targetExtentions.add('.png')
  if (config.plugins.optipng !== false) ctx.targetExtentions.add('.png')
  if (config.plugins.mozjpeg !== false)
    ctx.targetExtentions.add('.jpg').add('.jpeg')
  if (config.plugins.svgo !== false) ctx.targetExtentions.add('.svg')

  return ctx
}

export function updateViteUserConfig(
  ctx: Context,
  config: Settings,
  viteUserConfig: UserConfig
) {
  const root = getResolvedRoot(viteUserConfig.root)
  ctx.publicDir = getResolvedPublicDir(viteUserConfig.publicDir, root)

  // Prevent Vite default copy function for public directory
  if (config.public.preventDefault) viteUserConfig.publicDir = false

  if (config.asset.keepStructure) {
    config.asset.preventOverwrite = false
    return setupRollupOptionsForKeepStructure(ctx, viteUserConfig)
  }
  return
}

export function updateConfig(config: Settings, viteConfig: ResolvedConfig) {
  // Determine if `useCRC` should be used
  if (Array.isArray(viteConfig.build.rollupOptions.output)) {
    // If output is an array, set `true`
    config.asset.useCrc = true
  } else if (
    viteConfig.build.rollupOptions.output?.assetFileNames &&
    typeof viteConfig.build.rollupOptions.output.assetFileNames === 'string' &&
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
}

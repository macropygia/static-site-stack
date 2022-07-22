import os from 'os'
import path from 'path'

import pLimit from 'p-limit'

import type {
  AssetSettings,
  PublicSettings,
  UserSettings,
  Settings,
  Context,
} from './types.js'
import { initMatcher, outputLog } from './utils.js'
import { CacheDb } from './db.js'

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

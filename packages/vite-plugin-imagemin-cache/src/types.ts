import type { Logger, ResolvedConfig } from 'vite'
import type Loki from 'lokijs'
import type Picomatch from 'picomatch'
import type { LimitFunction } from 'p-limit'
import type { Options as PngquatOptions } from 'imagemin-pngquant'
import type { Options as OptipngOptions } from 'imagemin-optipng'
import type { Options as MozjpegOptions } from 'imagemin-mozjpeg'
import type { Options as SvgoOptions } from 'imagemin-svgo'

import type { CacheDb } from './db.js'

// Settings
export interface ImageminSettings {
  pngquant?: PngquatOptions | false
  optipng?: OptipngOptions | false
  mozjpeg?: MozjpegOptions | false
  svgo?: SvgoOptions | false
}

export interface AssetSettings {
  keepStructure: boolean
  cachebuster: boolean | string
  useCrc: boolean
  preventOverwrite: boolean
}

export interface PublicSettings {
  preventDefault: boolean
  preventOverwrite: boolean
}

export interface Settings {
  cacheDir: string
  expireDuration: number
  countToExpire: number
  concurrency: number
  exclude?: Picomatch.Glob | Picomatch.Matcher
  plugins: ImageminSettings
  asset: AssetSettings
  public: PublicSettings
}

export interface UserSettings
  extends Partial<Omit<Settings, 'asset' | 'public'>> {
  asset?: Partial<AssetSettings>
  public?: Partial<PublicSettings>
}

// Context
export interface Context {
  config: Settings
  viteConfig?: ResolvedConfig
  logger: Logger
  publicDir: string
  limit: LimitFunction
  cacheDb: CacheDb
  excludeMatcher: Picomatch.Matcher | false
  targetExtentions: Set<string>
  assetTargets: Set<string>
  assetHashMap: Map<string, number>
  publicTargets: Set<string>
  publicHashMap: Map<string, number>
}

// Cache database
export interface CacheData {
  fileName: string
  expirationCountdown: number
  lastProcessed: number
  checksum?: number
}

export interface CacheDocument extends CacheData, LokiObj {}

export interface CacheCollection extends Loki.Collection {}

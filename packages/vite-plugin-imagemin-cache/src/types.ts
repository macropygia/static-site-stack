import type Loki from 'lokijs'
import type Picomatch from 'picomatch'
import type { Options as ImageminPngquatOptions } from 'imagemin-pngquant'
import type { Options as ImageminOptipngOptions } from 'imagemin-optipng'
import type { Options as ImageminMozjpegOptions } from 'imagemin-mozjpeg'
import type { Options as ImageminSvgoOptions } from 'imagemin-svgo'
import type { Options as ImageminWebpOptions } from 'imagemin-webp'

export interface ImageminSettings {
  pngquant?: ImageminPngquatOptions | false
  optipng?: ImageminOptipngOptions | false
  mozjpeg?: ImageminMozjpegOptions | false
  svgo?: ImageminSvgoOptions | false
  webp?: ImageminWebpOptions | false
}

export interface Settings {
  cacheDir: string
  expireDuration: number
  countToExpire: number
  concurrency: number
  exclude?: Picomatch.Glob | Picomatch.Matcher
  plugins: ImageminSettings
}

export interface CacheData {
  fileName: string
  expirationCountdown: number
  lastProcessed: number
  checksum?: number
}

export interface CacheDocument extends CacheData, LokiObj {}

export interface CacheCollection extends Loki.Collection {}

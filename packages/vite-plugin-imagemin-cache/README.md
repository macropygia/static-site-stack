# @macropygia/vite-plugin-imagemin-cache

![TypeScript](https://img.shields.io/badge/TypeScript-3178c6?style=flat-square&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646cff?style=flat-square&logo=Vite&logoColor=white)

**English** | [日本語](README.ja_JP.md)

Vite plugin to compress image files using imagemin. With persistent cache.

## Usage

```js
import { defineConfig } from 'vite'
import vitePluginImageminCache from '@macropygia/vite-plugin-imagemin-cache'

export default defineConfig({
  plugins: [
    vitePluginImageminCache(),
  ],
})
```

## Default settings

```js
vitePluginImageminCache(
  {
    cacheDir: 'node_modules/.imagemin',
    expireDuration: 864000, // 10 days
    countToExpire: 10,
    concurrency: os.cpus().length,
    plugins: {} // If not set, run as default
  }
),
```

## Imagemin plugin settings

```js
vitePluginImageminCache(
  {
    plugins: {
      pngquant: { speed: 3, quality: [0.3, 0.5] },
      optipng: { optimizationLevel: 3 },
      mozjpeg: { quality: 60 },
      svgo: { plugins: [ ... ] },
      webp: false // Turn off
    }
  }
),
```

## Expiration

Cache files will delete when the following conditions are satisfied.

- Did not use in the last `countToExpire` times of build
- Over `expireDuration` seconds have passed since last used

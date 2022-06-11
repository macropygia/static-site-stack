# @macropygia/vite-plugin-imagemin-cache

[![npm version](https://img.shields.io/npm/v/@macropygia/vite-plugin-imagemin-cache.svg?style=flat-square)](https://www.npmjs.com/package/@macropygia/vite-plugin-imagemin-cache)
[![MIT](https://img.shields.io/npm/l/@macropygia/vite-plugin-imagemin-cache?style=flat-square)](./LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178c6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-646cff?style=flat-square&logo=Vite&logoColor=white)](https://vitejs.dev/)

**English** | [日本語](README.ja_JP.md)

Vite plugin to compress bundle and public images using imagemin. With persistent cache.

- **This package is currently unstable.**
    - Breaking changes may occur without any notice, even if in patch releases.
    - See [CHANGELOG](CHANGELOG.md) for changes.
- A filename of a bundle must contain a hash.

## Installation

```shell
npm install @macropygia/vite-plugin-imagemin-cache
```

## Usage

```js
import { defineConfig } from 'vite'
import vitePluginImageminCache from '@macropygia/vite-plugin-imagemin-cache'

export default defineConfig({
  plugins: [
    vitePluginImageminCache({
      cacheDir: '.cache',
      concurrency: 4,
      plugins: {
        pngquant: { quality: [0.6, 0.8] },
        mozjpeg: { quality: 85 },
      }
    }),
  ],
})
```

## Options

| Parameter        | Type                 | Default                  | Required |
| ---------------- | -------------------- | ------------------------ | -------- |
| `cacheDir`       | `string`             | `node_modules/.imagemin` | No       |
| `expireDuration` | `number`             | `864000` (10 Days)       | No       |
| `countToExpire`  | `number`             | `10`                     | No       |
| `concurrency`    | `number`             | `os.cpus().length`       | No       |
| `exclude`        | `string \| string[]` |                          | No       |
| `plugins`        | `object`             | `{}`                     | No       |

### cacheDir

- The directory structure is as same as the destination.

### expireDuration, countToExpire

Cache files will delete when the following conditions are satisfied.

- The file did not use in the last `countToExpire` times of the build.
- Over `expireDuration` seconds have passed since last used.

### concurrency

- The maximum concurrency of compressing.

### exclude

- Exclude patterns.
- Ref. [Globbing features - Picomatch](https://github.com/micromatch/picomatch#globbing-features)

### plugins

- Imagemin plugin settings.
- If the setting is empty, the plugin will run with its default settings.
- Following plugins and extensions are available.
    - imagemin-pngquant ( `.png` )
    - imagemin-optipng ( `.png` )
    - imagemin-mozjpeg ( `.jpg` and `.jpeg` )
    - imagemin-svgo ( `.svg` )

#### Example

```js
vitePluginImageminCache(
  {
    plugins: {
      pngquant: { speed: 1, quality: [0.6, 1.0] },
      optipng: false, // Turn off
      mozjpeg: { quality: 85 },
      svgo: { plugins: [ ... ] },
    },
  }
)
```

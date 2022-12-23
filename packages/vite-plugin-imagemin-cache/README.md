# @macropygia/vite-plugin-imagemin-cache

[![npm version](https://img.shields.io/npm/v/@macropygia/vite-plugin-imagemin-cache.svg?style=flat-square)](https://www.npmjs.com/package/@macropygia/vite-plugin-imagemin-cache)
[![MIT](https://img.shields.io/npm/l/@macropygia/vite-plugin-imagemin-cache?style=flat-square)](./LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178c6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-646cff?style=flat-square&logo=Vite&logoColor=white)](https://vitejs.dev/)

**English** | [日本語](README.ja_JP.md)

Vite plugin to compress static assets and public images using imagemin. With persistent cache.

- **This package is currently unstable.**
    - Breaking changes may occur without any notice, even if in patch releases.
    - See [CHANGELOG](CHANGELOG.md) for changes.
- This package [only works as ESM](https://gist.github.com/sindresorhus/a39789f98801d908bbc7ff3ecc99d99c).
    - `"type": "module"` is required in the package.json of the project using this plugin.

## Installation

```shell
$ npm install @macropygia/vite-plugin-imagemin-cache
```

## Usage

```js
import { defineConfig } from 'vite'
import imageminPlugin from '@macropygia/vite-plugin-imagemin-cache'

export default defineConfig({
  plugins: [
    imageminPlugin({
      cacheDir: '.cache',
      concurrency: 4,
      plugins: {
        pngquant: { quality: [0.65, 1] },
        mozjpeg: { quality: 85 },
      }
    }),
  ],
})
```

## Options

| Parameter                | Type                 | Default                  | Required |
| ------------------------ | -------------------- | ------------------------ | -------- |
| `cacheDir`               | `string`             | `node_modules/.imagemin` | No       |
| `expireDuration`         | `number`             | `864000` (10 Days)       | No       |
| `countToExpire`          | `number`             | `10`                     | No       |
| `concurrency`            | `number`             | `os.cpus().length`       | No       |
| `exclude`                | `string \| string[]` |                          | No       |
| `plugins`                | `object`             | `{}`                     | No       |
| `asset.cachbuster`       | `boolean \| string`  | `false`                  | No       |
| `asset.useCrc`           | `boolean`            | (Auto)                   | No       |
| `asset.preventOverwrite` | `boolean`            | `false`                  | No       |
| `public.preventDefault`  | `boolean`            | `false`                  | No       |

### cacheDir

Set the cache directory.

- The directory structure is as same as the destination.

### expireDuration, countToExpire

Cache files will delete when the following conditions are satisfied.

- The file did not use in the last `countToExpire` times of the build.
- Over `expireDuration` seconds have passed since last used.

### concurrency

The maximum concurrency of compressing.

### exclude

Glob patterns to exclude from compression.

- Ref. [Globbing features - Picomatch](https://github.com/micromatch/picomatch#globbing-features)

### plugins

Imagemin plugin settings.

- Following plugins are available with these extensions.
    - [imagemin-pngquant](https://www.npmjs.com/package/imagemin-pngquant) ( `.png` )
    - [imagemin-optipng](https://www.npmjs.com/package/imagemin-optipng) ( `.png` )
    - [imagemin-mozjpeg](https://www.npmjs.com/package/imagemin-mozjpeg) ( `.jpg` and `.jpeg` )
    - [imagemin-svgo](https://www.npmjs.com/package/imagemin-svgo) ( `.svg` )
- If the setting is empty, the plugin will run with its default settings.
- If set to `false` , it will be disabled.
- If settings about quality have changed, the cache must be cleared.

#### Example

```js
plugins: {
  pngquant: { speed: 1, quality: [0.6, 1.0] },
  optipng: false, // Turn off
  mozjpeg: { quality: 85 },
  svgo: { plugins: [ ... ] },
},
```

### asset.cachebuster (>= 0.1, experimental)

Add hash as a query string to attributes that references an image in HTML.

- Only works with HTML.
- If set `true` , join with `?` .
    - `/foo/bar.png` -> `/foo/bar.png?<hash>`
    - `/foo/baz.svg?q=123#id` -> `/foo/baz.svg?<hash>&q=123#id`
- If set `string` , join with the string.
    - `/foo/bar.png` -> `/foo/bar.png<string><hash>`
    - `/foo/baz.svg?q=123#id` -> `/foo/baz.svg<string><hash>&q=123#id`

### asset.useCrc (>= 0.1, experimental)

If set `true` , the plugin process static assets in the same way as the public directory.

- Normally, no need to use.
- This is prepared for complex settings in `rollupOptions.output.assetFileNames` .
    - Set to `true` if `[hash]` is not included in `assetFileNames`.

### asset.preventOverwrite (>= 0.1, experimental)

If the file with the same name exists in the output directory, skip copying from the cache.

- Do not use this option if the file name of static assets doesn't contain `[hash]` .
- No need to enable this option unless handling a huge number of images.
- Disable automatically when `emptyOutDir` is `true` .

### public.preventDefault (>= 0.1, experimental)

Stop Vite's default copy process for the public directory and copy compressed images and the others separately.

- By default, compressed images are overwritten after Vite copies all files in the public directory.
- This option will change true by default in a future release.

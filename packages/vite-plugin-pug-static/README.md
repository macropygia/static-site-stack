# @macropygia/vite-plugin-pug-static

[![npm version](https://img.shields.io/npm/v/@macropygia/vite-plugin-pug-static.svg?style=flat-square)](https://www.npmjs.com/package/@macropygia/vite-plugin-pug-static)
[![MIT](https://img.shields.io/npm/l/@macropygia/vite-plugin-pug-static?style=flat-square)](./LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178c6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-646cff?style=flat-square&logo=Vite&logoColor=white)](https://vitejs.dev)
[![Pug](https://img.shields.io/badge/Pug-a86454?style=flat-square&logo=pug&logoColor=white)](https://pugjs.org/)

**English** | [日本語](README.ja_JP.md)

Vite plugin to serve multiple Pug as HTML with middleware and build to static HTML.

- **This package is currently unstable.**
    - Breaking changes may occur without any notice, even if in patch releases.
    - See [CHANGELOG](CHANGELOG.md) for changes.
- Suitable for a traditional static site.
- Currently, full-reload is always triggered when any file is modified.

## Usage

```js
// vite.config.js
import { defineConfig } from 'vite'
import vitePluginPugStatic from '@macropygia/vite-plugin-pug-static'

export default defineConfig({
  plugins: [
    vitePluginPugStatic({
      buildOptions: { basedir: "./src" },
      serveOptions: { basedir: "./src" },
    }),
  ],
})
```

## Options

| Parameter       | Type                 | Default | Required |
| --------------- | -------------------- | ------- | -------- |
| `buildOptions`  | `object`             |         | No       |
| `serveOptions`  | `object`             |         | No       |
| `locals`        | `object`             |         | No       |
| `ignorePattern` | `string \| string[]` |         | No       |

### buildOptions

- Pug options for build.
- Ref. [Options - Pug](https://pugjs.org/api/reference.html#options)

### serveOptions

- Pug options for dev server.
- Ref. [Options - Pug](https://pugjs.org/api/reference.html#options)

### locals

- The locals object of pug.
- Ref. [API Reference - Pug](https://pugjs.org/api/reference.html#pugcompilesource-options)

### ignorePattern

- Ignore pattern for dev server.
- Ref. [Globbing features - Picomatch](https://github.com/micromatch/picomatch#globbing-features)
- Compatible with [vite-plugin-inpsect](https://www.npmjs.com/package/vite-plugin-inspect) by default.

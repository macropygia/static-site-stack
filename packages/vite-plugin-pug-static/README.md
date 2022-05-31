# @macropygia/vite-plugin-pug-static

[![npm version](https://img.shields.io/npm/v/@macropygia/vite-plugin-pug-static.svg?style=flat-square)](https://www.npmjs.com/package/@macropygia/vite-plugin-pug-static)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)](./LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178c6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-646cff?style=flat-square&logo=Vite&logoColor=white)](https://vitejs.dev)
[![Pug](https://img.shields.io/badge/Pug-a86454?style=flat-square&logo=pug&logoColor=white)](https://pugjs.org/)

**English** | [日本語](README.ja_JP.md)

Vite plugin to serve multiple Pug as HTML with middleware and build to static HTML.

- Suitable for a traditional static site
- Currently, full-reload is always triggered when any file is modified

## Usage

```js
// vite.config.js
import { defineConfig } from 'vite'
import vitePluginPugStatic from '@macropygia/vite-plugin-pug-static'

export default defineConfig({
  plugins: [
    vitePluginPugStatic({
      /* Options */
    }),
  ],
})
```

## Options

### buildOptions

- Required: `false`
- Type: `object`
- Ref. [Options - Pug](https://pugjs.org/api/reference.html#options)

Pug options for build.

### serveOptions

- Required: `false`
- Type: `object`
- Ref. [Options - Pug](https://pugjs.org/api/reference.html#options)

Pug options for dev server.

### locals

- Required: `false`
- Type: `object`

The locals object of pug.

### ignorePattern

- Required: `false`
- Type: `string | string[]`
- Ref. [Globbing features - Picomatch](https://github.com/micromatch/picomatch#globbing-features)

Ignore pattern for dev server. Compatible with `vite-plugin-inpsect` by default.

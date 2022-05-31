# @macropygia/vite-plugin-importer-invalidator

[![npm version](https://img.shields.io/npm/v/@macropygia/vite-plugin-importer-invalidator.svg?style=flat-square)](https://www.npmjs.com/package/@macropygia/vite-plugin-importer-invalidator)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)](./LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178c6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-646cff?style=flat-square&logo=Vite&logoColor=white)](https://vitejs.dev)

**English** | [日本語](README.ja_JP.md)

Vite plugin to invalidate importers when the target file is updated.

- Suitable for a traditional static site
- Works on dev server
- The module of the target file must have its importers.
    - The "module" here is the module in HMR of Vite.

## Usage

```js
// vite.config.js
import { defineConfig } from 'vite'
import vitePluginImporterInvalidator from '@macropygia/vite-plugin-importer-invalidator'

export default defineConfig({
  plugins: [
    vitePluginImporterInvalidator({
      /* Options */
    }),
  ],
})
```

### Example

Invalidate SCSS files when imported partial is updated.

```js
// vite.config.js
import { defineConfig } from 'vite'
import vitePluginImporterInvalidator from '@macropygia/vite-plugin-importer-invalidator'

export default defineConfig({
  plugins: [
    vitePluginImporterInvalidator({
      include: '**/_*.scss',
    }),
  ],
})
```

## Options

### include

- Required: `true`
- Type: `string | string[]`
- Ref. [Globbing features - Picomatch](https://github.com/micromatch/picomatch#globbing-features)

### exclude

- Required: `false`
- Type: `string | string[]`
- Ref. [Globbing features - Picomatch](https://github.com/micromatch/picomatch#globbing-features)

Process after include.

<!--
### useAbsPath

- Required: `false`
- Type: `boolean`
-->

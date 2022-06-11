# @macropygia/vite-plugin-importer-invalidator

[![npm version](https://img.shields.io/npm/v/@macropygia/vite-plugin-importer-invalidator.svg?style=flat-square)](https://www.npmjs.com/package/@macropygia/vite-plugin-importer-invalidator)
[![MIT](https://img.shields.io/npm/l/@macropygia/vite-plugin-importer-invalidator?style=flat-square)](./LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178c6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-646cff?style=flat-square&logo=Vite&logoColor=white)](https://vitejs.dev/)

**English** | [日本語](README.ja_JP.md)

Vite plugin to invalidate the importers of the target file when the file is modified.

- **This package is currently unstable.**
    - Breaking changes may occur without any notice, even if in patch releases.
    - See [CHANGELOG](CHANGELOG.md) for changes.
- Suitable for a traditional static site
- Works on dev server
- The module of the target file must have its importers.
    - The module here means the module in HMR of Vite.

## Usage

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

| Parameter | Type                 | Default | Required |
| --------- | -------------------- | ------- | -------- |
| `include` | `string \| string[]` |         | Yes      |
| `exclude` | `string \| string[]` |         | No       |

### include, exlude

- Ref. [Globbing features - Picomatch](https://github.com/micromatch/picomatch#globbing-features)

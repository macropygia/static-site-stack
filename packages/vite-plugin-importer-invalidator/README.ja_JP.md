# @macropygia/vite-plugin-importer-invalidator

[![npm version](https://img.shields.io/npm/v/@macropygia/vite-plugin-importer-invalidator.svg?style=flat-square)](https://www.npmjs.com/package/@macropygia/vite-plugin-importer-invalidator)
[![MIT](https://img.shields.io/npm/l/@macropygia/vite-plugin-importer-invalidator?style=flat-square)](./LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178c6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-646cff?style=flat-square&logo=Vite&logoColor=white)](https://vitejs.dev)

[English](README.md) | **日本語**

特定のファイルが更新されるとそのファイルに依存している全てのファイルをリロード対象にするViteプラグイン

- このパッケージは開発中です
    - パッチリリースを含め予告なく破壊的変更が行われる可能性があります
    - 変更点は [CHANGELOG](CHANGELOG.md) をご覧ください
- 従来型静的Webサイト向け
- 開発サーバ上で動作
- 対象ファイルのモジュールに依存関係が格納されている必要がある
    - ここでいう「モジュール」とはViteのHMRにおけるモジュールを指す

## 使用方法

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

## オプション

| Parameter | Type                 | Default | Required |
| --------- | -------------------- | ------- | -------- |
| `include` | `string \| string[]` |         | Yes      |
| `exclude` | `string \| string[]` |         | No       |

### include, exlude

- 参照: [Globbing features - Picomatch](https://github.com/micromatch/picomatch#globbing-features)

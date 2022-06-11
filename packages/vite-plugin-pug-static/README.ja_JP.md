# @macropygia/vite-plugin-pug-static

[![npm version](https://img.shields.io/npm/v/@macropygia/vite-plugin-pug-static.svg?style=flat-square)](https://www.npmjs.com/package/@macropygia/vite-plugin-pug-static)
[![MIT](https://img.shields.io/npm/l/@macropygia/vite-plugin-pug-static?style=flat-square)](./LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178c6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-646cff?style=flat-square&logo=Vite&logoColor=white)](https://vitejs.dev/)
[![Pug](https://img.shields.io/badge/Pug-a86454?style=flat-square&logo=pug&logoColor=white)](https://pugjs.org/)

[English](README.md) | **日本語**

複数の Pug を静的な HTML として扱う Vite プラグイン

- このパッケージは開発中です
    - パッチリリースを含め予告なく破壊的変更が行われる可能性があります
    - 変更点は [CHANGELOG](CHANGELOG.md) をご覧ください
- 従来型静的Webサイト向け
- 開発サーバではミドルウェアとして動作しHTMLへのアクセスに対してPugのコンパイル結果を出力する
- ビルド時はPugを静的なHTMLとして出力する
- 現時点ではあらゆるファイルの変更をトリガにフルリロードを行う（開発サーバ）
    - ViteのHMRにPugとHTMLの依存関係を注入する機能が未実装のため

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

- ビルドで使用するPugのオプション
- 参照: [Options - Pug](https://pugjs.org/api/reference.html#options)

### serveOptions

- 開発サーバで使用するPugのオプション
- 参照: [Options - Pug](https://pugjs.org/api/reference.html#options)

### locals

- ビルド時に注入するlocalsオブジェクト
- 参照: [API Reference - Pug](https://pugjs.org/api/reference.html#pugcompilesource-options)

### ignorePattern

- 開発サーバで変換から除外するパターン
- 参照: [Globbing features - Picomatch](https://github.com/micromatch/picomatch#globbing-features)
- [vite-plugin-inpsect](https://www.npmjs.com/package/vite-plugin-inspect) に関連するアクセスは標準で除外される

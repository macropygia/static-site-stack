# @macropygia/vite-plugin-pug-static

[![npm version](https://img.shields.io/npm/v/@macropygia/vite-plugin-pug-static.svg?style=flat-square)](https://www.npmjs.com/package/@macropygia/vite-plugin-pug-static)
[![MIT](https://img.shields.io/npm/l/@macropygia/vite-plugin-pug-static?style=flat-square)](./LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178c6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-646cff?style=flat-square&logo=Vite&logoColor=white)](https://vitejs.dev/)
[![Pug](https://img.shields.io/badge/Pug-a86454?style=flat-square&logo=pug&logoColor=white)](https://pugjs.org/)

[English](README.md) | **日本語**

複数のPugを静的なHTMLとして扱うViteプラグイン

- このパッケージは不安定版です
    - パッチリリースを含め予告なく破壊的変更が行われる可能性があります
    - 変更点は [CHANGELOG](CHANGELOG.md) をご覧ください
- このパッケージはESM（ES Modules）としてのみ動作します
    - 使用するプロジェクトの `package.json` で `"type": "module"` を指定する必要があります
    - 参考: [Pure ESM package](https://gist.github.com/sindresorhus/a39789f98801d908bbc7ff3ecc99d99c)
- 従来型静的Webサイト向け
- 開発サーバではミドルウェアとして動作しHTMLへのアクセスに対してPugのコンパイル結果を出力する
- ビルド時はPugを静的なHTMLとして出力する
- 現時点ではあらゆるファイルの変更をトリガにフルリロードを行う（開発サーバ）
    - コンパイルは必要な場合のみ実行される

## Usage

```js
// vite.config.js
import { defineConfig } from 'vite'
import vitePluginPugStatic from '@macropygia/vite-plugin-pug-static'

export default defineConfig({
  root: 'src',
  build: {
    rollupOptions: {
      input: {
        home: 'src/index.pug',
        foo: 'src/foo/index.pug',
        bar: 'src/bar/index.pug',
      }
    }
  },
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
| `buildLocals`   | `object`             |         | No       |
| `serveOptions`  | `object`             |         | No       |
| `serverLocals`  | `object`             |         | No       |
| `ignorePattern` | `string \| string[]` |         | No       |
| `reload`        | `boolean`            | `true`  | No       |

### buildOptions

- ビルドで使用するPugのオプション
- 参照: [Options - Pug](https://pugjs.org/api/reference.html#options)

### buildLocals

- ビルド時に注入するlocalsオブジェクト
- 参照: [API Reference - Pug](https://pugjs.org/api/reference.html#pugcompilesource-options)

### serveOptions

- 開発サーバで使用するPugのオプション
- 参照: [Options - Pug](https://pugjs.org/api/reference.html#options)

### serveLocals

- 開発サーバにおけるコンパイル時に注入するlocalsオブジェクト
- 参照: [API Reference - Pug](https://pugjs.org/api/reference.html#pugcompilesource-options)

### ignorePattern

- 開発サーバで変換から除外するパターン
- ルート相対パスで指定する（ `/` から始まる）
- 参照: [Globbing features - Picomatch](https://github.com/micromatch/picomatch#globbing-features)
- [vite-plugin-inspect](https://www.npmjs.com/package/vite-plugin-inspect) に関連するアクセスは標準で除外される

### reload

- ファイルが変更された際のリロードの有効/無効を設定する

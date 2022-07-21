# @macropygia/vite-plugin-glob-input

[![npm version](https://img.shields.io/npm/v/@macropygia/vite-plugin-glob-input.svg?style=flat-square)](https://www.npmjs.com/package/@macropygia/vite-plugin-glob-input)
[![MIT](https://img.shields.io/npm/l/@macropygia/vite-plugin-glob-input?style=flat-square)](./LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178c6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-646cff?style=flat-square&logo=Vite&logoColor=white)](https://vitejs.dev/)

[English](README.md) | **日本語**

fast-globの結果を `build.rollupOptions.input` に注入するViteプラグイン

- このパッケージは不安定版です
    - パッチリリースを含め予告なく破壊的変更が行われる可能性があります
    - 変更点は [CHANGELOG](CHANGELOG.md) をご覧ください
- このパッケージはESM（ES Modules）としてのみ動作します
    - 使用するプロジェクトの `package.json` で `"type": "module"` を指定する必要があります
    - 参考: [Pure ESM package](https://gist.github.com/sindresorhus/a39789f98801d908bbc7ff3ecc99d99c)
- 従来型静的Webサイト向け
- ディレクトリ名とファイル名からエイリアスを自動生成
    - `/index.html` -> `home`
    - `/foo.html` -> `root_foo`
    - `/foo/index.html` -> `foo`
    - `/foo/bar.html` -> `foo_bar`
- `build.rollupOptions.input` が存在する場合は上書きせずに追加
    - 文字列の場合を除く
    - 重複チェックなし

## 使用方法

```js
// vite.config.js
import { defineConfig } from 'vite'
import vitePluginGlobInput from '@macropygia/vite-plugin-glob-input'

export default defineConfig({
  plugins: [
    vitePluginGlobInput({
      patterns: 'src/**/*.html',
    }),
  ],
})
```

## オプション

| Parameter      | Type                 | Default | Required |
| -------------- | -------------------- | ------- | -------- |
| `patterns`     | `string \| string[]` |         | Yes      |
| `options`      | `object`             |         | No       |
| `disableAlias` | `boolean`            | `false` | No       |
| `homeAlias`    | `string`             | `home`  | No       |
| `rootPrefix`   | `string`             | `root`  | No       |
| `dirDelimiter` | `string`             | `-`     | No       |
| `filePrefix`   | `string`             | `_`     | No       |

### patterns

- fast-globのパターン指定と同一
- 参照: [Pattern syntax - fast-glob](https://github.com/mrmlnc/fast-glob#pattern-syntax)

### options

- fast-globのオプションと同一
    - ただし `options.absolute` は強制的に `true` に設定される
- 参照: [Options - fast-glob](https://github.com/mrmlnc/fast-glob#options-3)

### disableAlias

- エイリアスの自動生成を停止する
- `build.rollupOptions.input` の型を配列（ `string[]` ）に変更

### homeAlias

ルートディレクトリのindexに使用されるエイリアス。

> /index.html -> home

### rootPrefix

ルートディレクトリのエイリアス。ルートディレクトリにindex以外のファイルがある場合に使用される。

> /foo.html -> root_foo

### dirDelimiter

ディレクトリ名を連結する文字列。

> /foo/bar/index.html -> foo-bar

### filePrefix

index以外のファイルに付与される接頭辞。

> /foo/bar/baz.html -> foo-bar_baz

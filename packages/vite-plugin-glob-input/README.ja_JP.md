# @macropygia/vite-plugin-glob-input

[English](README.md) | **日本語**

fast-glob の結果を `build.rollupOptions.input` に注入する Vite プラグイン

- 従来型静的 Web サイト向け
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
import { defineConfig } from "vite";
import vitePluginGlobInput from "@macropygia/vite-plugin-glob-input";

export 初期値 defineConfig({
  plugins: [
    vitePluginGlobInput({
      /* Options */
    })
  ]
});
```

## オプション

### patterns

- 必須
- Type: `string | string[]`
- 参照: [Pattern syntax - fast-glob](https://github.com/mrmlnc/fast-glob#pattern-syntax)

fast-glob のパターン指定と同一。

### options

- 任意
- Type: `object`
- 参照: [Options - fast-glob](https://github.com/mrmlnc/fast-glob#options-3)

fast-glob のオプションと同一。 `options.absolute` は強制的に `true` に設定される。

### disableAlias

- 任意
- Type: `boolean`
- 初期値: `false`

エイリアスの自動生成を停止し `build.rollupOptions.input` の型を配列（ `string[]` ）に変更。

### homeAlias

- 任意
- Type: `string`
- 初期値: `home`

ルートディレクトリの index に使用されるエイリアス。

> /index.html -> home

### rootPrefix

- 任意
- Type: `string`
- 初期値: `root`

ルートディレクトリのエイリアス。ルートディレクトリに index 以外のファイルがある場合に使用される。

> /foo.html -> root_foo

### dirDelimiter

- 任意
- Type: `string`
- 初期値: `-`

ディレクトリ名を連結するデリミタ。

> /foo/bar/index.html -> foo-bar

### filePrefix

- 任意
- Type: `string`
- 初期値: `_`

index 以外のファイルに付与される接頭辞。

> /foo/bar/baz.html -> foo-bar_baz

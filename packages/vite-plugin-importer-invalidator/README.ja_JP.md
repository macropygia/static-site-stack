# @macropygia/vite-plugin-importer-invalidator

[English](README.md) | **日本語**

特定のファイルが更新されるとそのファイルに依存している全てのファイルをリロード対象にする Vite プラグイン

- 開発サーバ上で動作
- 対象ファイルのモジュールに依存関係が格納されている必要がある
    - ここでいう「モジュール」とは Vite の HMR におけるモジュールを指す

## 使用方法

```js
// vite.config.js
import { defineConfig } from 'vite'
import vitePluginImporterInvalidator from 'vite-plugin-importer-invalidator'

export default defineConfig({
  plugins: [
    vitePluginImporterInvalidator({
      /* Options */
    }),
  ],
})
```

### 使用例

読み込んでいるパーシャルが更新された時に SCSS をリロードする。

```js
// vite.config.js
import { defineConfig } from 'vite'
import vitePluginImporterInvalidator from 'vite-plugin-importer-invalidator'

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

対象の Glob パターンを指定する。

### exclude

- Required: `false`
- Type: `string | string[]`
- Ref. [Globbing features - Picomatch](https://github.com/micromatch/picomatch#globbing-features)

対象から外す Glob パターンを指定する。（ `include -> exclude` の順に処理される）

<!--
### useAbsPath

- Required: `false`
- Type: `boolean`
-->

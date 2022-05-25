# @macropygia/vite-plugin-pug-static

[English](README.md) | **日本語**

複数の Pug を静的な HTML として扱う Vite プラグイン

- 従来型静的 Web サイト向け
- 開発サーバではミドルウェアとして動作し HTML へのアクセスに対して Pug のコンパイル結果を出力する
- ビルド時は Pug を静的な HTML として出力する
- 現時点ではあらゆるファイルの変更をトリガにフルリロードを行う（開発サーバ）
    - Vite の HMR に Pug と HTML の依存関係を注入する機能が未実装のため

## 使用方法

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

## オプション

### buildOptions

- Required: `false`
- Type: `object`
- Ref. [Options - Pug](https://pugjs.org/api/reference.html#options)

ビルド時に使用する Pug のオプション。

### serveOptions

- Required: `false`
- Type: `object`
- Ref. [Options - Pug](https://pugjs.org/api/reference.html#options)

開発サーバで使用する Pug のオプション。

### locals

- Required: `false`
- Type: `object`

Pug のコンパイル時に注入する locals オブジェクト。

### ignorePattern

- Required: `false`
- Type: `string | string[]`
- Ref. [Globbing features - Picomatch](https://github.com/micromatch/picomatch#globbing-features)

開発サーバ上で処理対象から除外するパターン。なお `vite-plugin-inpsect` には標準で対応している。

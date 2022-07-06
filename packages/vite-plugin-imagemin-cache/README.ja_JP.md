# @macropygia/vite-plugin-imagemin-cache

[![npm version](https://img.shields.io/npm/v/@macropygia/vite-plugin-imagemin-cache.svg?style=flat-square)](https://www.npmjs.com/package/@macropygia/vite-plugin-imagemin-cache)
[![MIT](https://img.shields.io/npm/l/@macropygia/vite-plugin-imagemin-cache?style=flat-square)](./LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178c6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-646cff?style=flat-square&logo=Vite&logoColor=white)](https://vitejs.dev/)

[English](README.md) | **日本語**

バンドルおよびpublic配下の画像に対してimageminを実行するViteプラグイン（永続化キャッシュつき）

- このパッケージは開発中です
    - パッチリリースを含め予告なく破壊的変更が行われる可能性があります
    - 変更点は [CHANGELOG](CHANGELOG.md) をご覧ください
- このパッケージはESM（ES Modules）としてのみ動作します
    - 使用するプロジェクトの `package.json` で `"type": "module"` を指定する必要があります
    - 参考: [Pure ESM package](https://gist.github.com/sindresorhus/a39789f98801d908bbc7ff3ecc99d99c)
- バンドルファイルはファイル名にハッシュを含んでいる必要がある

## インストール

```shell
npm install @macropygia/vite-plugin-imagemin-cache
```

## 使用方法

```js
import { defineConfig } from 'vite'
import vitePluginImageminCache from '@macropygia/vite-plugin-imagemin-cache'

export default defineConfig({
  plugins: [
    vitePluginImageminCache({
      cacheDir: '.cache',
      concurrency: 4,
      plugins: {
        pngquant: { quality: [0.6, 0.8] },
        mozjpeg: { quality: 85 },
      }
    }),
  ],
})
```

## オプション

| Parameter        | Type                 | Default                  | Required |
| ---------------- | -------------------- | ------------------------ | -------- |
| `cacheDir`       | `string`             | `node_modules/.imagemin` | No       |
| `expireDuration` | `number`             | `864000` (10 Days)       | No       |
| `countToExpire`  | `number`             | `10`                     | No       |
| `concurrency`    | `number`             | `os.cpus().length`       | No       |
| `exclude`        | `string \| string[]` |                          | No       |
| `plugins`        | `object`             | `{}`                     | No       |

### cacheDir

- キャッシュディレクトリ配下のディレクトリ構造はViteの出力と同一

### expireDuration, countToExpire

以下の条件を両方満たしたキャッシュファイルは自動的に削除される

- 直近の `countToExpire` 回のビルドで使用されていない
- 最後に使用してから `expireDuration` 秒以上経過している

### concurrency

- 圧縮処理の最大同時実行数

### exclude

- 除外パターン
- 参照: [Globbing features - Picomatch](https://github.com/micromatch/picomatch#globbing-features)

### plugins

- imageminプラグインの設定
- 設定が空のプラグインは標準設定で実行される
- 以下のプラグインが使用できる（カッコ内は対応する拡張子）
    - imagemin-pngquant ( `.png` )
    - imagemin-optipng ( `.png` )
    - imagemin-mozjpeg ( `.jpg` and `.jpeg` )
    - imagemin-svgo ( `.svg` )

#### 設定例

```js
vitePluginImageminCache(
  {
    plugins: {
      pngquant: { speed: 1, quality: [0.6, 1.0] },
      optipng: false, // 不使用
      mozjpeg: { quality: 85 },
      svgo: { plugins: [ ... ] },
    },
  }
)
```

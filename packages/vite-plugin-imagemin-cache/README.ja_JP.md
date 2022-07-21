# @macropygia/vite-plugin-imagemin-cache

[![npm version](https://img.shields.io/npm/v/@macropygia/vite-plugin-imagemin-cache.svg?style=flat-square)](https://www.npmjs.com/package/@macropygia/vite-plugin-imagemin-cache)
[![MIT](https://img.shields.io/npm/l/@macropygia/vite-plugin-imagemin-cache?style=flat-square)](./LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178c6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-646cff?style=flat-square&logo=Vite&logoColor=white)](https://vitejs.dev/)

[English](README.md) | **日本語**

静的アセットおよびpublicディレクトリ配下の画像に対してimageminを実行するViteプラグイン（キャッシュつき）

- このパッケージは不安定版です
    - パッチリリースを含め予告なく破壊的変更が行われる可能性があります
    - 変更点は [CHANGELOG](CHANGELOG.md) をご覧ください
- このパッケージはESM（ES Modules）としてのみ動作します
    - 使用するプロジェクトの `package.json` で `"type": "module"` を指定する必要があります
    - 参考: [Pure ESM package](https://gist.github.com/sindresorhus/a39789f98801d908bbc7ff3ecc99d99c)

## インストール

```shell
$ npm install @macropygia/vite-plugin-imagemin-cache
```

## 使用方法

```js
import { defineConfig } from 'vite'
import imageminPlugin from '@macropygia/vite-plugin-imagemin-cache'

export default defineConfig({
  plugins: [
    imageminPlugin({
      cacheDir: '.cache',
      concurrency: 4,
      plugins: {
        pngquant: { quality: [0.65, 1] },
        mozjpeg: { quality: 85 },
      }
    }),
  ],
})
```

## オプション

| Parameter                | Type                 | Default                  | Required |
| ------------------------ | -------------------- | ------------------------ | -------- |
| `cacheDir`               | `string`             | `node_modules/.imagemin` | No       |
| `expireDuration`         | `number`             | `864000` (10日)          | No       |
| `countToExpire`          | `number`             | `10`                     | No       |
| `concurrency`            | `number`             | `os.cpus().length`       | No       |
| `exclude`                | `string \| string[]` |                          | No       |
| `plugins`                | `object`             | `{}`                     | No       |
| `asset.keepStructure`    | `boolean`            | `false`                  | No       |
| `asset.cachbuster`       | `boolean \| string`  | `false`                  | No       |
| `asset.useCrc`           | `boolean`            | (自動)                   | No       |
| `asset.preventOverwrite` | `boolean`            | `false`                  | No       |
| `public.preventDefault`  | `boolean`            | `false`                  | No       |

### cacheDir

キャッシュディレクトリを指定する

- キャッシュディレクトリ配下のディレクトリ構造はViteの出力と同一

### expireDuration, countToExpire

以下の条件を両方満たしたキャッシュファイルは自動的に削除される

- 直近の `countToExpire` 回のビルドで使用されていない
- 最後に使用してから `expireDuration` 秒以上経過している

### concurrency

圧縮処理の最大同時実行数

### exclude

圧縮から除外するglobパターン

- 参照: [Globbing features - Picomatch](https://github.com/micromatch/picomatch#globbing-features)

### plugins

imageminプラグインの設定

- 以下のプラグインが使用できる（カッコ内は対応する拡張子）
    - [imagemin-pngquant](https://www.npmjs.com/package/imagemin-pngquant) ( `.png` )
    - [imagemin-optipng](https://www.npmjs.com/package/imagemin-optipng) ( `.png` )
    - [imagemin-mozjpeg](https://www.npmjs.com/package/imagemin-mozjpeg) ( `.jpg` and `.jpeg` )
    - [imagemin-svgo](https://www.npmjs.com/package/imagemin-svgo) ( `.svg` )
- 設定が空のプラグインは標準設定で実行される
- `false` を指定したプラグインは無効化される

#### 設定例

```js
plugins: {
  pngquant: { speed: 1, quality: [0.6, 1.0] },
  optipng: false, // 不使用
  mozjpeg: { quality: 85 },
  svgo: { plugins: [ ... ] },
},
```

### asset.keepStructure (>= 0.1, experimental)

ソース上のディレクトリ構造とファイル名を維持して出力する

- `asset.cachbuster` 併用可
- `rollupOptions.output.assetFileNames` 併用可（要文字列指定）
    - 画像以外のファイルに適用される
- `asset.useCrc` は自動的に `true` になる
- `asset.preventOverwrite` は自動的に `false` になる

### asset.cachebuster (>= 0.1, experimental)

HTML内で画像を参照している属性にクエリパラメータとしてハッシュを追加する

- HTMLでのみ有効
- `true` に設定した場合は `?` で連結する
    - `/foo/bar.png` -> `/foo/bar.png?<hash>`
    - `/foo/baz.svg?q=123#id` -> `/foo/baz.svg?<hash>&q=123#id`
- 文字列を設定した場合はその文字列で連結する
    - `/foo/bar.png` -> `/foo/bar.png<string><hash>`
    - `/foo/baz.svg?q=123#id` -> `/foo/baz.svg<string><hash>&q=123#id`

### asset.useCrc (>= 0.1, experimental)

`true` に設定すると静的アセット内の画像をpublicディレクトリと同様の方法で処理する

- 通常は設定不要
- `rollupOptions.output.assetFileNames` で複雑な設定を行う場合に使用する
    - 静的アセット画像のファイル名に `[hash]` が含まれない場合は `true` を指定する

### asset.preventOverwrite (>= 0.1, experimental)

出力ディレクトリに同名のファイルが存在する場合はキャッシュからのコピーをスキップする

- 出力ファイル名がハッシュを含まない場合は使用しないこと
- 差分ビルドが必要になるような大量の画像ファイルが存在する場合に使用する
- Viteの設定で `emptyOutDir` が `true` の場合は無効

### public.preventDefault (>= 0.1, experimental)

Vite標準のpublicディレクトリのコピーを停止し、圧縮対象の画像とそれ以外のファイルを分けてコピーする

- 標準ではViteがpublicディレクトリ内の全てのファイルをコピーした後に圧縮された画像が上書きされる
- この設定は今後のリリースで既定が `true` になる予定

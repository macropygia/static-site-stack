# @macropygia/vite-plugin-connect-middleware

[![npm version](https://img.shields.io/npm/v/@macropygia/vite-plugin-connect-middleware.svg?style=flat-square)](https://www.npmjs.com/package/@macropygia/vite-plugin-connect-middleware)
[![MIT](https://img.shields.io/npm/l/@macropygia/vite-plugin-connect-middleware?style=flat-square)](./LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178c6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-646cff?style=flat-square&logo=Vite&logoColor=white)](https://vitejs.dev/)

[English](README.md) | **日本語**

開発サーバ・プレビューサーバのミドルウェアを設定するためのViteプラグイン

- このパッケージは開発中です
    - パッチリリースを含め予告なく破壊的変更が行われる可能性があります
    - 変更点は [CHANGELOG](CHANGELOG.md) をご覧ください
- このパッケージはESM（ES Modules）としてのみ動作します
    - 使用するプロジェクトの `package.json` で `"type": "module"` を指定する必要があります
    - 参考: [Pure ESM package](https://gist.github.com/sindresorhus/a39789f98801d908bbc7ff3ecc99d99c)

## 使用方法

参照: [Use middleware - Connect](https://github.com/senchalabs/connect#use-middleware)

### 開発サーバ・プレビューサーバが同一のミドルウェアを使用する場合

```js
// vite.config.js
import { defineConfig } from 'vite'
import vitePluginConnectMiddleware from '@macropygia/vite-plugin-connect-middleware'

const reDownloads = /^\/downloads\/(?<dir>sound|video)\/(?<path>.*)$/

export default defineConfig({
  plugins: [
    vitePluginConnectMiddleware(
      (req, res, next) => {
        if (req.url) {
          if (req.url.startsWith('/app/')) {
            req.url = '/app/'
          } else if (reDownloads.test(req.url)) {
            const reResult = req.url.match(reDownloads)
            res.writeHead(301, {
              Location: `https://example.com/downloads/${
                reResult.groups['dir']
              }/${reResult.groups['path']}`,
            })
          }
        }
        return next()
      }
    ),
  ],
})
```

### 開発サーバ・プレビューサーバが異なるミドルウェアを使用する場合

```js
vitePluginConnectMiddleware({
  // 開発サーバ用
  dev: (req, res, next) => {
    // ...
  },
  // プレビューサーバ用
  preview: (req, res, next) => {
    // ...
  },
}),
```

- `dev` ないし `preview` は省略可

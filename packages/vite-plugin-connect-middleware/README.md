# @macropygia/vite-plugin-connect-middleware

[![npm version](https://img.shields.io/npm/v/@macropygia/vite-plugin-connect-middleware.svg?style=flat-square)](https://www.npmjs.com/package/@macropygia/vite-plugin-connect-middleware)
[![MIT](https://img.shields.io/npm/l/@macropygia/vite-plugin-connect-middleware?style=flat-square)](./LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178c6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-646cff?style=flat-square&logo=Vite&logoColor=white)](https://vitejs.dev/)

**English** | [日本語](README.ja_JP.md)

Vite plugin to configure middleware for dev and preview servers.

- **This package is currently unstable.**
    - Breaking changes may occur without any notice, even if in patch releases.
    - See [CHANGELOG](CHANGELOG.md) for changes.

## Usage

Ref. [Use middleware - Connect](https://github.com/senchalabs/connect#use-middleware)

### Both servers use the same middleware

```js
// vite.config.js
import { defineConfig } from 'vite'
import vitePluginConnectMiddleware from '@macropygia/vite-plugin-connect-middleware'

const reDownloads = /^\/downloads\/(?<dir>sound|movie)\/(?<path>.*)$/

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

### Servers use different middleware

```js
vitePluginConnectMiddleware({
  // for dev server
  dev: (req, res, next) => {
    // ...
  },
  // for preview server
  preview: (req, res, next) => {
    // ...
  },
}),
```

- `dev` and `preview` are optional

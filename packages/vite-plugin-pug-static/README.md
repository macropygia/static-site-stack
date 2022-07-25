# @macropygia/vite-plugin-pug-static

[![npm version](https://img.shields.io/npm/v/@macropygia/vite-plugin-pug-static.svg?style=flat-square)](https://www.npmjs.com/package/@macropygia/vite-plugin-pug-static)
[![MIT](https://img.shields.io/npm/l/@macropygia/vite-plugin-pug-static?style=flat-square)](./LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178c6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-646cff?style=flat-square&logo=Vite&logoColor=white)](https://vitejs.dev/)
[![Pug](https://img.shields.io/badge/Pug-a86454?style=flat-square&logo=pug&logoColor=white)](https://pugjs.org/)

**English** | [日本語](README.ja_JP.md)

Vite plugin to serve multiple Pug as HTML with middleware and build to static HTML.

- **This package is currently unstable.**
    - Breaking changes may occur without any notice, even if in patch releases.
    - See [CHANGELOG](CHANGELOG.md) for changes.
- This package [only works as ESM](https://gist.github.com/sindresorhus/a39789f98801d908bbc7ff3ecc99d99c).
    - `"type": "module"` is required in the package.json of the project using this plugin.
- Suitable for a traditional static site.
- Currently, full-reload is always triggered when any file is modified.
    - Compilation is triggered only when necessary.

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

- Pug options for build.
- Ref. [Options - Pug](https://pugjs.org/api/reference.html#options)

### buildLocals

- The locals object of pug for build.
- Ref. [API Reference - Pug](https://pugjs.org/api/reference.html#pugcompilesource-options)

### serveOptions

- Pug options for dev server.
- Ref. [Options - Pug](https://pugjs.org/api/reference.html#options)

### serveLocals

- The locals object of pug for dev server.
- Ref. [API Reference - Pug](https://pugjs.org/api/reference.html#pugcompilesource-options)

### ignorePattern

- Ignore pattern for dev server.
- Use root-relative path. (Starts with `/` )
- Ref. [Globbing features - Picomatch](https://github.com/micromatch/picomatch#globbing-features)
- Compatible with [vite-plugin-inspect](https://www.npmjs.com/package/vite-plugin-inspect) by default.

### reload

- Enable/disable full-reload when any file is modified.

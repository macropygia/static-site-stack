# @macropygia/vite-plugin-pug-static

**English** | [日本語](README.ja_JP.md)

Vite plugin to serve multiple Pug as HTML with middleware and build to static HTML.

- Suitable for a traditional static site
- Currently, full-reload is always triggered when any file is modified.
- `/**/` and `**/*.html`

## Usage

```js
// vite.config.js
import { defineConfig } from 'vite'
import vitePluginPugStatic from 'vite-plugin-pug-static'

export default defineConfig({
  plugins: [
    vitePluginPugStatic({
      /* Options */
    }),
  ],
})
```

## Options

### buildOptions

- Required: `false`
- Type: `object`;
- Ref. [Options - Pug](https://pugjs.org/api/reference.html#options)

Pug options for build.

### serveOptions

- Required: `false`
- Type: `object`;
- Ref. [Options - Pug](https://pugjs.org/api/reference.html#options)

Pug options for dev server.

### locals

- Required: `false`
- Type: `object`;

The locals object of pug.

### ignorePattern

- Required: `false`
- Type: `string | string[]`;
- Ref. [Globbing features - Picomatch](https://github.com/micromatch/picomatch#globbing-features)

Ignore pattern for dev server. Compatible with `vite-plugin-inpsect` by default.

# @macropygia/vite-plugin-glob-input

[![npm version](https://img.shields.io/npm/v/@macropygia/vite-plugin-glob-input.svg?style=flat-square)](https://www.npmjs.com/package/@macropygia/vite-plugin-glob-input)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)](./LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178c6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-646cff?style=flat-square&logo=Vite&logoColor=white)](https://vitejs.dev)

**English** | [日本語](README.ja_JP.md)

Vite plugin to add files using fast-glob to `build.rollupOptions.input`

- Suitable for a traditional static site
- Auto-generate alias from directory and file name
    - `/index.html` -> `home`
    - `/foo.html` -> `root_foo`
    - `/foo/index.html` -> `foo`
    - `/foo/bar.html` -> `foo_bar`
- Merge `build.rollupOptions.input` if it already exists
    - Except string
    - No duplicate check

## Usage

```js
// vite.config.js
import { defineConfig } from 'vite'
import vitePluginGlobInput from '@macropygia/vite-plugin-glob-input'

export default defineConfig({
  plugins: [
    vitePluginGlobInput({
      /* Options */
    }),
  ],
})
```

## Options

### patterns

- Required: `true`
- Type: `string | string[]`
- Ref. [Pattern syntax - fast-glob](https://github.com/mrmlnc/fast-glob#pattern-syntax)

Same as the fast-glob patterns.

### options

- Required: `false`
- Type: `object`
- Ref. [Options - fast-glob](https://github.com/mrmlnc/fast-glob#options-3)

Same as the fast-glob options. `options.absolute` is forced to be `true` .

### disableAlias

- Required: `false`
- Type: `boolean`
- Default: `false`

Disable alias auto-generation and change type of `build.rollupOptions.input` to `string[]`.

### homeAlias

- Required: `false`
- Type: `string`
- Default: `home`

Alias for index in root directory.

> /index.html -> home

### rootPrefix

- Required: `false`
- Type: `string`
- Default: `root`

Alias for root directory. It will use when the root directory has non-index files.

> /foo.html -> root_foo

### dirDelimiter

- Required: `false`
- Type: `string`
- Default: `-`

Delimiter for joining directory names.

> /foo/bar/index.html -> foo-bar

### filePrefix

- Required: `false`
- Type: `string`
- Default: `_`

Prefix for non-index files.

> /foo/bar/baz.html -> foo-bar_baz

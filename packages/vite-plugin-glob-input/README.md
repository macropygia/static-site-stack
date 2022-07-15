# @macropygia/vite-plugin-glob-input

[![npm version](https://img.shields.io/npm/v/@macropygia/vite-plugin-glob-input.svg?style=flat-square)](https://www.npmjs.com/package/@macropygia/vite-plugin-glob-input)
[![MIT](https://img.shields.io/npm/l/@macropygia/vite-plugin-glob-input?style=flat-square)](./LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178c6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-646cff?style=flat-square&logo=Vite&logoColor=white)](https://vitejs.dev/)

**English** | [日本語](README.ja_JP.md)

Vite plugin to add files to `build.rollupOptions.input` using fast-glob.

- **This package is currently unstable.**
    - Breaking changes may occur without any notice, even if in patch releases.
    - See [CHANGELOG](CHANGELOG.md) for changes.
- This package [only works as ESM](https://gist.github.com/sindresorhus/a39789f98801d908bbc7ff3ecc99d99c).
    - `"type": "module"` is required in the package.json of the project using this plugin.
- Suitable for a traditional static site.
- Auto-generate alias from directory and file name.
    - `/index.html` -> `home`
    - `/foo.html` -> `root_foo`
    - `/foo/index.html` -> `foo`
    - `/foo/bar.html` -> `foo_bar`
- Merge `build.rollupOptions.input` if it already exists.
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
      patterns: 'src/**/*.html',
    }),
  ],
})
```

## Options

| Parameter      | Type                 | Default | Required |
| -------------- | -------------------- | ------- | -------- |
| `patterns`     | `string \| string[]` |         | Yes      |
| `options`      | `object`             |         | No       |
| `disableAlias` | `boolean`            | `false` | No       |
| `homeAlias`    | `string`             | `home`  | No       |
| `rootPrefix`   | `string`             | `root`  | No       |
| `dirDelimiter` | `string`             | `-`     | No       |
| `filePrefix`   | `string`             | `_`     | No       |

### patterns

- Same as the fast-glob patterns
- Ref. [Pattern syntax - fast-glob](https://github.com/mrmlnc/fast-glob#pattern-syntax)

### options

- Same as the fast-glob options.
    - `options.absolute` is forced to be `true` .
- Ref. [Options - fast-glob](https://github.com/mrmlnc/fast-glob#options-3)

### disableAlias

- Disable alias auto-generation.
- Change type of `build.rollupOptions.input` to `string[]`.

### homeAlias

Alias for index in root directory.

> /index.html -> home

### rootPrefix

Alias for root directory. It will use when the root directory has non-index files.

> /foo.html -> root_foo

### dirDelimiter

Delimiter for joining directory names.

> /foo/bar/index.html -> foo-bar

### filePrefix

Prefix for non-index files.

> /foo/bar/baz.html -> foo-bar_baz

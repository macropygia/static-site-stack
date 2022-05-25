# @macropygia/vite-plugin-importer-invalidator

**English** | [日本語](README.ja_JP.md)

Vite plugin to invalidate importers when the target file is updated.

- Works on dev server
- The module of the target file must have its importers.
    - The "module" here is the module in HMR of Vite.

## Usage

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

### Example

Invalidate SCSS files when imported partial is updated.

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

### exclude

- Required: `false`
- Type: `string | string[]`
- Ref. [Globbing features - Picomatch](https://github.com/micromatch/picomatch#globbing-features)

Process after include.

<!--
### useAbsPath

- Required: `false`
- Type: `boolean`
-->

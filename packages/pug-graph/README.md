# @macropygia/pug-graph

[![npm version](https://img.shields.io/npm/v/@macropygia/pug-graph.svg?style=flat-square)](https://www.npmjs.com/package/@macropygia/pug-graph)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)](./LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178c6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Pug](https://img.shields.io/badge/Pug-a86454?style=flat-square&logo=pug&logoColor=white)](https://pugjs.org/)

**English** | [日本語](README.ja_JP.md)

The pug parser to parse only `include` and `extends` .

- Recommended to run [prettier](https://www.npmjs.com/package/@prettier/plugin-pug) before execution

## Limitation

- Use only spaces for indentation

## Usage

```js
import fg from 'fast-glob'
import PugGraph from '@macropygia/pug-graph'

// Init
const graph = new PugGraph({ baseDir: 'src' })

// Insert
await graph.parse('src/foo.pug')

// Insert recursively
await graph.parse('src/foo.pug', { recursive: true })

// Update
await graph.parse('src/foo.pug')

// Delete
graph.unlink('src/foo.pug')

// Multiple files
const files = fg.sync('src/**/[^_]*.pug')
await Promise.all(
  files.map((file) =>
    graph.parse(file, { recursive: true })
  )
)

// Get dependencies
const fooDependsOn = graph.getImportedFiles('src/foo.pug')
const barIsImportedBy = graph.getImporters('src/templates/mixins/_bar.pug', {
  ignorePartial: true,
})

// Exit (Currently not required, but reserved for persistence option.)
graph.exit()
```

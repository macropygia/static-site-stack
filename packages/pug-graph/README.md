# @macropygia/pug-graph

[![npm version](https://img.shields.io/npm/v/@macropygia/pug-graph.svg?style=flat-square)](https://www.npmjs.com/package/@macropygia/pug-graph)
[![MIT](https://img.shields.io/npm/l/@macropygia/pug-graph?style=flat-square)](./LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178c6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Pug](https://img.shields.io/badge/Pug-a86454?style=flat-square&logo=pug&logoColor=white)](https://pugjs.org/)

**English** | [日本語](README.ja_JP.md)

Parses `include` and `extends` in Pug files and gets dependencies.

- **This package is currently unstable.**
    - Breaking changes may occur without any notice, even if in patch releases.
    - See [CHANGELOG](CHANGELOG.md) for changes.
- Recommended running Prettier with [@prettier/plugin-pug](https://www.npmjs.com/package/@prettier/plugin-pug) before execution.
- Use only spaces for indentation.

## Installation

```shell
npm install @macropygia/pug-graph
```

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

// Exit
graph.exit()
```

## API

### constructor(options)

| Parameter            | Type      | Default | Required |
| -------------------- | --------- | ------- | -------- |
| `options.baseDir`    | `string`  | `""`    | No       |
| `options.useAbsPath` | `boolean` | `false` | No       |

- `options.baseDir`
    - Same as Pug option.
- `options.useAbsPath`
    - Use absolute path.

### parse(filepath, options)

| Parameter                   | Type      | Default | Required |
| --------------------------- | --------- | ------- | -------- |
| `filepath`                  | `string`  |         | Yes      |
| `options.insertOnly`        | `boolean` | `false` | No       |
| `options.recursive`         | `boolean` | `false` | No       |
| `options.updateDescendants` | `boolean` | `false` | No       |

- Asynchronous
- `options.insertOnly`
    - Skip if the file already exists in the database.
- `options.recursive`
    - Parse recursively.
    - Skip if the file of the descendants already exists in the database.
- `options.updateDescendants`
    - Use with recursive option.
    - Force update the descendants.

### getImportedFiles(filepath)

| Parameter  | Type     | Default | Required |
| ---------- | -------- | ------- | -------- |
| `filepath` | `string` |         | Yes      |

- Returns: `Set<string>`

### getImporters(filepath, ignorePartial)

| Parameter       | Type      | Default | Required |
| --------------- | --------- | ------- | -------- |
| `filepath`      | `string`  |         | Yes      |
| `ignorePartial` | `boolean` | `true`  | No       |

- Returns: `Set<string>`

### unlink(filepath)

| Parameter  | Type     | Default | Required |
| ---------- | -------- | ------- | -------- |
| `filepath` | `string` |         | Yes      |

### getRawData()

- Returns: `object[]`
- Returns all records as object array.

### exit()

- Close the database and exit.

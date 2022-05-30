# @macropygia/pug-graph

**English** | [日本語](README.ja_JP.md)

The pug parser to parse only `include` and `extends` .

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

import path from 'path'

import fg from 'fast-glob'

import PugGraph from '../src'

const indexPug = '__tests__/tree/index.pug'
const indexPugAbs = path.resolve('__tests__/tree/index.pug')
const templatePug = '__tests__/tree/templates/_global.pug'

test('Single File', async () => {
  const graph = new PugGraph({
    baseDir: '__tests__/tree',
    verbose: true,
  })

  await graph.parse(indexPug)
  await graph.parse(indexPug, { insertOnly: true })
  graph.unlink(indexPug)
  graph.exit()
})

test('Single File (Recursive)', async () => {
  const graph = new PugGraph({
    baseDir: '__tests__/tree',
    useAbsPath: true,
  })

  await graph.parse(indexPugAbs, { recursive: true, insertOnly: true })
  await graph.parse(indexPugAbs, { recursive: true })

  graph.exit()
})

test('Multiple Files', async () => {
  const graph = new PugGraph({
    baseDir: '__tests__/tree',
  })

  const files = fg.sync('__tests__/tree/**/*.pug')

  await Promise.all(
    files.map((file) => graph.parse(file, { insertOnly: true }))
  )

  console.log(graph.getImportedFiles(indexPug))
  console.log(graph.getImporters(templatePug))
  console.log(graph.getImporters(templatePug, false))
  console.log(graph.getRawData())

  graph.exit()
})

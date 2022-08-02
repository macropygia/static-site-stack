import path from 'node:path'

import fg from 'fast-glob'
import { describe, beforeAll, afterAll, test, expect } from 'vitest'

import PugGraph from '../src/index.js'

const indexPug = '__tests__/src/index.pug'
const indexPugAbs = path.resolve('__tests__/src/index.pug')
const templatePug = '__tests__/src/templates/_global.pug'

describe('Single File', () => {
  let graph: PugGraph
  beforeAll(async () => {
    graph = new PugGraph({
      baseDir: '__tests__/src',
    })
  })
  test('parse', async () => {
    await graph.parse(indexPug)
    expect(JSON.stringify(graph.getRawData())).toMatchSnapshot()
  })
  test('parse (insertOnly)', async () => {
    await graph.parse(indexPug, { insertOnly: true })
    expect(JSON.stringify(graph.getRawData())).toMatchSnapshot()
  })
  test('unlink', async () => {
    graph.unlink(indexPug)
    expect(JSON.stringify(graph.getRawData())).toMatchSnapshot()
  })
  afterAll(async () => {
    graph.exit()
  })
})

describe('Single File (Recursive)', () => {
  let graph: PugGraph
  beforeAll(async () => {
    graph = new PugGraph({
      baseDir: '__tests__/src',
      useAbsPath: true,
    })
  })
  test('parse (recursive, insertOnly)', async () => {
    await graph.parse(indexPugAbs, { recursive: true, insertOnly: true })
    expect(JSON.stringify(graph.getRawData())).toMatchSnapshot()
  })
  test('parse (recursive)', async () => {
    await graph.parse(indexPugAbs, { recursive: true })
    expect(JSON.stringify(graph.getRawData())).toMatchSnapshot()
  })
  afterAll(async () => {
    graph.exit()
  })
})

describe('Multiple Files', () => {
  let graph: PugGraph
  beforeAll(async () => {
    graph = new PugGraph({
      baseDir: '__tests__/src',
    })
    const files = fg.sync('__tests__/src/**/*.pug')
    await Promise.all(
      files.map((file) => graph.parse(file, { insertOnly: true }))
    )
  })
  test('getImportedFiles', async () => {
    expect(
      JSON.stringify([...graph.getImportedFiles(indexPug)])
    ).toMatchSnapshot()
  })
  test('getImporters', async () => {
    expect(
      JSON.stringify([...graph.getImporters(templatePug)])
    ).toMatchSnapshot()
  })
  test('getImporters (ignorePartial)', async () => {
    expect(
      JSON.stringify([...graph.getImporters(templatePug, true)])
    ).toMatchSnapshot()
  })
  test('getRawData', async () => {
    expect(JSON.stringify(graph.getRawData())).toMatchSnapshot()
  })
  afterAll(async () => {
    graph.exit()
  })
})

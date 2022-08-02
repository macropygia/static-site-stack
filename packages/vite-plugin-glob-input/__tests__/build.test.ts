import path from 'node:path'

import fse from 'fs-extra'
import { beforeEach, afterAll, test, expect } from 'vitest'
import { build } from 'vite'
import type { UserConfig } from 'vite'

import inputPlugin, { UserSettings } from '../src/index.js'

const srcdir = path.resolve(__dirname, 'src')
const distdir = path.resolve(__dirname, 'dist')

const defaultConfig = (pluginConfig: UserSettings): UserConfig => {
  return {
    root: srcdir,
    build: {
      outDir: distdir,
      emptyOutDir: true,
    },
    plugins: [inputPlugin(pluginConfig)],
  }
}

const exists = (filepath: string): boolean =>
  fse.existsSync(path.join(distdir, filepath))

beforeEach(async () => {
  await fse.emptyDir(distdir)
})

afterAll(async () => {
  await fse.remove(distdir)
})

test('all', async () => {
  const config = defaultConfig({
    patterns: '__tests__/src/**/*.html',
  })
  await build(config)
  expect(exists('index.html')).toBeTruthy()
  expect(exists('non-index.html')).toBeTruthy()
  expect(exists('subdir/index.html')).toBeTruthy()
  expect(exists('subdir/non-index.html')).toBeTruthy()
  expect(exists('ignore/ignore.html')).toBeTruthy()
  expect(exists('ignore/_index.html')).toBeTruthy()
})

test('ignore', async () => {
  const config = defaultConfig({
    patterns: '__tests__/src/**/[^_]*.html',
    options: {
      ignore: ['**/ignore.html'],
    },
  })
  await build(config)
  expect(exists('index.html')).toBeTruthy()
  expect(exists('non-index.html')).toBeTruthy()
  expect(exists('subdir/index.html')).toBeTruthy()
  expect(exists('subdir/non-index.html')).toBeTruthy()
  expect(exists('ignore/ignore.html')).toBeFalsy()
  expect(exists('ignore/_index.html')).toBeFalsy()
})

test('disableAlias', async () => {
  const config = defaultConfig({
    disableAlias: true,
    patterns: '__tests__/src/**/[^_]*.html',
    options: {
      ignore: ['**/ignore.html'],
    },
  })
  await build(config)
  expect(exists('index.html')).toBeTruthy()
  expect(exists('non-index.html')).toBeTruthy()
  expect(exists('subdir/index.html')).toBeTruthy()
  expect(exists('subdir/non-index.html')).toBeTruthy()
  expect(exists('ignore/ignore.html')).toBeFalsy()
  expect(exists('ignore/_index.html')).toBeFalsy()
})

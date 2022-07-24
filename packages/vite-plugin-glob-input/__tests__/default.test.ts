import path from 'path'

import fse from 'fs-extra'
import { beforeEach, afterAll, test } from 'vitest'
import { build } from 'vite'
import type { UserConfig } from 'vite'

import inputPlugin, { UserSettings } from '../src/index.js'

const srcdir = path.resolve(__dirname, 'src')
const distdir = path.resolve(__dirname, 'dist')

const pluginConfig: UserSettings = {
  patterns: '__tests__/src/**/[^_]*.html',
  options: {
    ignore: ['**/ignore.html'],
  },
}

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

beforeEach(async () => {
  await fse.emptyDir(distdir)
})

afterAll(async () => {
  await fse.remove(distdir)
})

test('default', async () => {
  const config = defaultConfig(pluginConfig)
  await build(config)
})

test('disableAlias', async () => {
  const config = defaultConfig({ ...pluginConfig, ...{ disableAlias: true } })
  await build(config)
})

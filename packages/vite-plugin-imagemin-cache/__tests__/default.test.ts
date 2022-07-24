import path from 'node:path'

import fse from 'fs-extra'
import picomatch from 'picomatch'
import { beforeEach, afterAll, test } from 'vitest'
import { build } from 'vite'
// import type vite from 'vite'

import imageminPlugin from '../src/index.js'

const srcdir = path.resolve(__dirname, 'src')
const distdir = path.resolve(__dirname, 'dist')
const cachedir = path.resolve(__dirname, 'cache')

const defaultPluginConfig = {
  cacheDir: cachedir,
  asset: {
    keepStructure: false,
    cachebuster: false,
    useCrc: false,
    preventOverwrite: false,
  },
  public: {
    preventDefault: false,
  },
}

function createPluginConfig(override?: any): any {
  return {
    ...defaultPluginConfig,
    ...override,
  }
}

const defaultConfig = {
  root: srcdir,
  build: {
    outDir: distdir,
    emptyOutDir: true,
  },
}

function createConfig(buildConfig?: any, pluginConfig?: any): any {
  return {
    ...defaultConfig,
    build: {
      ...defaultConfig.build,
      ...buildConfig,
    },
    plugins: [imageminPlugin(pluginConfig)],
  }
}

beforeEach(async () => {
  // await fse.emptyDir(distdir)
})

afterAll(async () => {
  await Promise.all([fse.remove(distdir), fse.remove(cachedir)])
})

test('default', async () => {
  await build(createConfig())
})

test('preventDefault / expire (preparing)', async () => {
  await build(
    createConfig(
      {},
      createPluginConfig({
        countToExpire: 1,
        public: { preventDefault: true },
      })
    )
  )
})

test('preventOverwrite / expire (preparing)', async () => {
  await build(
    createConfig(
      { emptyOutDir: false },
      createPluginConfig({
        countToExpire: 1,
        asset: { preventOverwrite: true },
      })
    )
  )
})

test('keepStructure and cachebuster', async () => {
  await build(
    createConfig(
      {},
      createPluginConfig({
        asset: {
          keepStructure: true,
          cachebuster: true,
        },
      })
    )
  )
})

test('keepStructure with cache', async () => {
  await build(
    createConfig(
      {},
      createPluginConfig({
        asset: {
          keepStructure: true,
          cachebuster: true,
        },
      })
    )
  )
})

test('cachebuster with string / set assetFileNames / expire', async () => {
  await build(
    createConfig(
      {
        rollupOptions: {
          output: {
            assetFileNames: `another/[name].[hash].[ext]`,
          },
        },
      },
      createPluginConfig({
        expireDuration: 0,
        asset: {
          keepStructure: true,
          cachebuster: '?v=',
        },
      })
    )
  )
})

test('assetFileNames without [hash] / exclude with array', async () => {
  await build(
    createConfig(
      {
        rollupOptions: {
          output: {
            assetFileNames: `asset/[name].[ext]`,
          },
        },
      },
      createPluginConfig({
        exclude: ['**/*.png'],
      })
    )
  )
})

test('exclude with string / nothing to do / preventOverwrite auto off', async () => {
  await build(
    createConfig(
      {},
      createPluginConfig({
        exclude: '**/*',
        asset: {
          preventOverwrite: true,
        },
      })
    )
  )
})

test('exclude with matcher', async () => {
  await build(
    createConfig(
      {},
      createPluginConfig({
        exclude: picomatch('**/*'),
      })
    )
  )
})

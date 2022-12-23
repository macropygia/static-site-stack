import path from 'node:path'

import fse from 'fs-extra'
import fg from 'fast-glob'
import { crc32 } from 'polycrc'
import picomatch from 'picomatch'
import { beforeEach, afterAll, test, expect } from 'vitest'
import { build } from 'vite'
// import type vite from 'vite'

import imageminPlugin from '../src/index.js'

const srcdir = path.resolve(__dirname, 'src')
const distdir = path.resolve(__dirname, 'dist')
const cachedir = path.resolve(__dirname, 'cache')

const defaultPluginConfig = {
  cacheDir: cachedir,
  asset: {
    // Disable keepStructure (2022-12-22)
    // keepStructure: false,
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
    rollupOptions: {
      output: {
        assetFileNames: 'assets/[name].[hash].[ext]', // Disable keepStructure (2022-12-22)
      },
    },
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

function getFileList(dir: string): Record<string, number> {
  const buffer: Record<string, number> = {}
  fg.sync(`${dir}/**`).forEach((file) => {
    const source = fse.readFileSync(file)
    buffer[file] = crc32(source)
  })
  return buffer
}

afterAll(async () => {
  await Promise.all([fse.remove(distdir), fse.remove(cachedir)])
})

test('default', async () => {
  await build(createConfig({}, defaultPluginConfig))
  expect(JSON.stringify(getFileList('__tests__/dist'))).toMatchInlineSnapshot(
    '"{\\"__tests__/dist/favicon.ico\\":1843141432,\\"__tests__/dist/favicon.svg\\":1900386957,\\"__tests__/dist/index.html\\":2811407307,\\"__tests__/dist/assets/index.28a21df5.css\\":3207623224,\\"__tests__/dist/assets/test.8e95ac79.svg\\":160342448,\\"__tests__/dist/assets/test.c3cde17a.jpg\\":239154759}"'
  )
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
  expect(JSON.stringify(getFileList('__tests__/dist'))).toMatchInlineSnapshot(
    '"{\\"__tests__/dist/favicon.ico\\":1843141432,\\"__tests__/dist/favicon.svg\\":1900386957,\\"__tests__/dist/index.html\\":2811407307,\\"__tests__/dist/assets/index.28a21df5.css\\":3207623224,\\"__tests__/dist/assets/test.8e95ac79.svg\\":160342448,\\"__tests__/dist/assets/test.c3cde17a.jpg\\":239154759}"'
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
  expect(JSON.stringify(getFileList('__tests__/dist'))).toMatchInlineSnapshot(
    '"{\\"__tests__/dist/favicon.ico\\":1843141432,\\"__tests__/dist/favicon.svg\\":1900386957,\\"__tests__/dist/index.html\\":2811407307,\\"__tests__/dist/assets/index.28a21df5.css\\":3207623224,\\"__tests__/dist/assets/test.8e95ac79.svg\\":160342448,\\"__tests__/dist/assets/test.c3cde17a.jpg\\":239154759}"'
  )
})

// test('keepStructure and cachebuster', async () => {
//   await build(
//     createConfig(
//       {},
//       createPluginConfig({
//         asset: {
//           keepStructure: true,
//           cachebuster: true,
//         },
//       })
//     )
//   )
//   expect(JSON.stringify(getFileList('__tests__/dist'))).toMatchInlineSnapshot(
//     '"{\\"__tests__/dist/favicon.ico\\":1843141432,\\"__tests__/dist/favicon.svg\\":1900386957,\\"__tests__/dist/index.html\\":2499871409,\\"__tests__/dist/test.jpg\\":239154759,\\"__tests__/dist/assets/index.28a21df5.css\\":3207623224,\\"__tests__/dist/subdir/test.svg\\":160342448}"'
//   )
// })

// test('keepStructure with cache', async () => {
//   await build(
//     createConfig(
//       {},
//       createPluginConfig({
//         asset: {
//           keepStructure: true,
//           cachebuster: true,
//         },
//       })
//     )
//   )
//   expect(JSON.stringify(getFileList('__tests__/dist'))).toMatchInlineSnapshot(
//     '"{\\"__tests__/dist/favicon.ico\\":1843141432,\\"__tests__/dist/favicon.svg\\":1900386957,\\"__tests__/dist/index.html\\":2499871409,\\"__tests__/dist/test.jpg\\":239154759,\\"__tests__/dist/assets/index.28a21df5.css\\":3207623224,\\"__tests__/dist/subdir/test.svg\\":160342448}"'
//   )
// })

// test('cachebuster with string / set assetFileNames / expire', async () => {
//   await build(
//     createConfig(
//       {
//         rollupOptions: {
//           output: {
//             assetFileNames: `another/[name].[hash].[ext]`,
//           },
//         },
//       },
//       createPluginConfig({
//         expireDuration: 0,
//         asset: {
//           keepStructure: true,
//           cachebuster: '?v=',
//         },
//       })
//     )
//   )
//   expect(JSON.stringify(getFileList('__tests__/dist'))).toMatchInlineSnapshot(
//     '"{\\"__tests__/dist/favicon.ico\\":1843141432,\\"__tests__/dist/favicon.svg\\":1900386957,\\"__tests__/dist/index.html\\":1979819173,\\"__tests__/dist/test.jpg\\":239154759,\\"__tests__/dist/another/index.28a21df5.css\\":3207623224,\\"__tests__/dist/subdir/test.svg\\":160342448}"'
//   )
// })

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
  expect(JSON.stringify(getFileList('__tests__/dist'))).toMatchInlineSnapshot(
    '"{\\"__tests__/dist/favicon.ico\\":1843141432,\\"__tests__/dist/favicon.svg\\":1900386957,\\"__tests__/dist/index.html\\":1383037182,\\"__tests__/dist/asset/index.css\\":3207623224,\\"__tests__/dist/asset/test.jpg\\":239154759,\\"__tests__/dist/asset/test.svg\\":160342448}"'
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
  expect(JSON.stringify(getFileList('__tests__/dist'))).toMatchInlineSnapshot(
    '"{\\"__tests__/dist/favicon.ico\\":1843141432,\\"__tests__/dist/favicon.svg\\":1118345576,\\"__tests__/dist/index.html\\":2811407307,\\"__tests__/dist/assets/index.28a21df5.css\\":3207623224,\\"__tests__/dist/assets/test.8e95ac79.svg\\":3600371036,\\"__tests__/dist/assets/test.c3cde17a.jpg\\":3570719741}"'
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
  expect(JSON.stringify(getFileList('__tests__/dist'))).toMatchInlineSnapshot(
    '"{\\"__tests__/dist/favicon.ico\\":1843141432,\\"__tests__/dist/favicon.svg\\":1118345576,\\"__tests__/dist/index.html\\":2811407307,\\"__tests__/dist/assets/index.28a21df5.css\\":3207623224,\\"__tests__/dist/assets/test.8e95ac79.svg\\":3600371036,\\"__tests__/dist/assets/test.c3cde17a.jpg\\":3570719741}"'
  )
})

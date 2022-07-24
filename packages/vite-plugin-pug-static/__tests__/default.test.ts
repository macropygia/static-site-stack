import path from 'node:path'

import fse from 'fs-extra'
import axios from 'axios'
import { afterAll, test } from 'vitest'
import { createServer, build } from 'vite'
import type { UserConfig } from 'vite'

import pugPlugin from '../src/index.js'
import { outputLog } from '../src/utils.js'

const srcdir = path.resolve(__dirname, 'src')
const distdir = path.resolve(__dirname, 'dist')

const defaultConfig = (): UserConfig => {
  return {
    root: srcdir,
    build: {
      outDir: distdir,
      emptyOutDir: true,
      rollupOptions: {
        input: {
          home: '__tests__/src/index.pug',
        },
      },
    },
    plugins: [
      pugPlugin({
        buildOptions: { basedir: srcdir },
        buildLocals: { mode: 'build' },
        serveOptions: { basedir: srcdir },
        serveLocals: { mode: 'serve' },
        ignorePattern: ['/ignore/**'],
        reload: true,
      }),
    ],
  }
}

afterAll(async () => {
  await Promise.all([fse.remove(distdir)])
})

test('serve', async () => {
  const config = defaultConfig()
  const server = await createServer(config)
  await server.listen()
  // server.printUrls()
  await axios.get('http://localhost:5173/')
  await axios.get('http://localhost:5173/index.html')
  await axios.get('http://localhost:5173/html/index.html')
  try {
    await axios.get('http://localhost:5173/nothtml.jpg')
  } catch {
    /**/
  }
  try {
    await axios.get('http://localhost:5173/ignore/')
  } catch {
    /**/
  }
  try {
    await axios.get('http://localhost:5173/notfound/')
  } catch {
    /**/
  }
  try {
    await axios.get('http://localhost:5173/invalid/')
  } catch {
    /**/
  }
  try {
    await axios.get('http://localhost:5173/__inspect/')
  } catch {
    /**/
  }
  fse.outputFileSync(path.join(srcdir, `_partial.pug`), 'p test')
  await axios.get('http://localhost:5173/')
  fse.outputFileSync(path.join(srcdir, `_partial.pug`), 'p partial')
  await axios.get('http://localhost:5173/')
  server.close()
})

test('build', async () => {
  const config = defaultConfig()
  config.build!.rollupOptions!.input!['foo'] = '__tests__/src/html/index.html'
  config.build!.rollupOptions!.input!['bar'] = '__tests__/src/sample.ts'
  try {
    await build(config)
  } catch {
    /**/
  }
})

test('outputLog', async () => {
  outputLog('info', '', '', 'dim')
  outputLog('info', 'green', 'yellow', '')
})

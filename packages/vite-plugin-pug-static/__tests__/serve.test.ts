import path from 'node:path'

import fse from 'fs-extra'
import axios, { AxiosError } from 'axios'
import { beforeAll, afterAll, describe, test, expect } from 'vitest'
import { createServer, ViteDevServer } from 'vite'
import type { UserConfig } from 'vite'

import pugPlugin from '../src/index.js'

const srcdir = path.resolve(__dirname, 'src')
const distdir = path.resolve(__dirname, 'dist')

const config: UserConfig = {
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

let server: ViteDevServer

beforeAll(async () => {
  server = await createServer(config)
  await server.listen()
  // server.printUrls()
})

afterAll(async () => {
  server.close()
})

describe('serve', () => {
  test('get /', async () => {
    await axios.get('http://localhost:5173/').then((res) => {
      expect(res.data).toMatchInlineSnapshot(`
        "<!DOCTYPE html><html><head>
          <script type="module" src="/@vite/client"></script>
        </head><body><h1>serve</h1><p>partial</p></body></html>"
      `)
    })
  })
  test('get /index.html', async () => {
    await axios.get('http://localhost:5173/index.html').then((res) => {
      expect(res.data).toMatchInlineSnapshot(`
        "<!DOCTYPE html><html><head>
          <script type="module" src="/@vite/client"></script>
        </head><body><h1>serve</h1><p>partial</p></body></html>"
      `)
    })
  })
  test('get /html/index.html', async () => {
    await axios.get('http://localhost:5173/html/index.html').then((res) => {
      expect(res.data).toMatchInlineSnapshot(`
        "<!DOCTYPE html>
        <html>
        <head>
          <script type="module" src="/@vite/client"></script>

        </head>
        <body>
        <p>html</p>
        </body>
        </html>
        "
      `)
    })
  })
  test('get /nothtml.jpg', async () => {
    await axios
      .get('http://localhost:5173/nothtml.jpg')
      .catch((err: unknown) => {
        if (err instanceof AxiosError) expect(err.response?.status).toBe(404)
      })
  })
  test('get /ignore/', async () => {
    await axios.get('http://localhost:5173/ignore/').catch((err: unknown) => {
      if (err instanceof AxiosError) expect(err.response?.status).toBe(404)
    })
  })
  test('get /notfound/', async () => {
    await axios.get('http://localhost:5173/notfound/').catch((err: unknown) => {
      if (err instanceof AxiosError) expect(err.response?.status).toBe(404)
    })
  })
  test('get /invalid/', async () => {
    await axios.get('http://localhost:5173/invalid/').catch((err: unknown) => {
      if (err instanceof AxiosError) expect(err.response?.status).toBe(500)
    })
  })
  test('get /__inspect/', async () => {
    await axios
      .get('http://localhost:5173/__inspect/')
      .catch((err: unknown) => {
        if (err instanceof AxiosError) expect(err.response?.status).toBe(404)
      })
  })
  test('get modified /', async () => {
    await fse.outputFile(path.join(srcdir, `_partial.pug`), 'p test')
    await axios
      .get('http://localhost:5173/')
      .then(async (res) => {
        expect(res.data).toMatchInlineSnapshot(`
          "<!DOCTYPE html><html><head>
            <script type="module" src="/@vite/client"></script>
          </head><body><h1>serve</h1><p>test</p></body></html>"
        `)
      })
      .finally(async () => {
        await fse.outputFile(path.join(srcdir, `_partial.pug`), 'p partial')
      })
  })
})

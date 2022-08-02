import path from 'node:path'

import axios from 'axios'
import { describe, beforeAll, afterAll, test, expect } from 'vitest'
import { createServer, preview, PreviewServer, ViteDevServer } from 'vite'
import type { UserConfig } from 'vite'

import middlewarePlugin, { Middleware, Settings } from '../src/index.js'

const srcdir = path.resolve(__dirname, 'src')
const distdir = path.resolve(__dirname, 'dist')

const middleware: Middleware = (req, res, next) => {
  if (req.url) {
    if (req.url.startsWith('/app/')) {
      req.url = '/app/index.html'
    }
    if (req.url.startsWith('/external/')) {
      res.writeHead(301, { Location: 'https://example.com/' })
      return res.end()
    }
  }
  return next()
}

const defaultConfig = (pluginConfig: Settings): UserConfig => ({
  root: srcdir,
  build: {
    outDir: distdir,
  },
  plugins: [middlewarePlugin(pluginConfig)],
})

describe('dev', () => {
  let server: ViteDevServer
  beforeAll(async () => {
    server = await createServer(
      defaultConfig({
        dev: middleware,
        preview: middleware,
      })
    )
    await server.listen()
    server.printUrls()
  })
  test('index', async () => {
    await axios.get('http://localhost:5173/index.html').then((res) => {
      expect(res.data).toMatchInlineSnapshot(`
        "<!DOCTYPE html><html><head>
          <script type=\\"module\\" src=\\"/@vite/client\\"></script>
        </head><body><p>/index.html</p></body></html>
        "
      `)
    })
  })
  test('app', async () => {
    await axios.get('http://localhost:5173/app/subdir/').then((res) => {
      expect(res.data).toMatchInlineSnapshot(`
        "<!DOCTYPE html><html><head>
          <script type=\\"module\\" src=\\"/@vite/client\\"></script>
        </head><body><p>/app/index.html</p></body></html>
        "
      `)
    })
  })
  test('external', async () => {
    await axios.get('http://localhost:5173/external/').then((res) => {
      expect(res.data).toMatchSnapshot()
    })
  })
  afterAll(async () => {
    await server.close()
  })
})

describe('preview', () => {
  let server: PreviewServer
  beforeAll(async () => {
    server = await preview(defaultConfig(middleware))
    server.printUrls()
  })
  test('index', async () => {
    await axios.get('http://localhost:4173/').then((res) => {
      expect(res.data).toMatchInlineSnapshot(`
        "<!DOCTYPE html><html><head></head><body><p>/index.html</p></body></html>
        "
      `)
    })
  })
  test('app', async () => {
    await axios.get('http://localhost:4173/app/subdir/').then((res) => {
      expect(res.data).toMatchInlineSnapshot(`
        "<!DOCTYPE html><html><head></head><body><p>/app/index.html</p></body></html>
        "
      `)
    })
  })
  test('external', async () => {
    await axios.get('http://localhost:4173/external/').then((res) => {
      expect(res.data).toMatchSnapshot()
    })
  })
  afterAll(async () => {
    server.httpServer.close()
  })
})

import path from 'node:path'

import axios from 'axios'
import { test } from 'vitest'
import { createServer, preview } from 'vite'
import type { UserConfig } from 'vite'

import middlewarePlugin, { Middleware, Settings } from '../src/index.js'

const srcdir = path.resolve(__dirname, 'src')
const distdir = path.resolve(__dirname, 'dist')

const middleware: Middleware = (req, _res, next) => {
  if (req.url) {
    if (req.url.startsWith('/app/')) {
      req.url = '/app/'
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

test('dev', async () => {
  const server = await createServer(
    defaultConfig({
      dev: middleware,
      preview: middleware,
    })
  )
  await server.listen()
  server.printUrls()
  await server.close()
})

test('preview', async () => {
  const server = await preview(defaultConfig(middleware))
  server.printUrls()
  server.httpServer.close()
})

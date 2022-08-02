import fs from 'node:fs'
import path from 'node:path'
import { URL } from 'node:url'
import type http from 'node:http'

import type Pug from 'pug'
import type { Plugin, ViteDevServer, Connect } from 'vite'
import { send } from 'vite'
import type Picomatch from 'picomatch'
import picomatch from 'picomatch'

import { compilePug } from './pug.js'

/**
 * @param options - Pug options
 * @param locals - Pug locals object
 * @param ignorePattern - Ignore patterns for converting Pug to HTML
 * @param reload - Reload settings (Currently, only enable/disable control)
 */
interface ServeSettings {
  options: Pug.Options | undefined
  locals: Pug.LocalsObject | undefined
  ignorePattern: Picomatch.Glob | undefined
  reload: boolean | undefined
}

export type Middleware = (
  req: Connect.IncomingMessage,
  res: http.ServerResponse,
  next: Connect.NextFunction
) => void | http.ServerResponse | Promise<void | http.ServerResponse>

const middleware = (
  settings: ServeSettings,
  server: ViteDevServer
): Middleware => {
  const { options, locals, ignorePattern } = settings
  const ignoreMatcher = ignorePattern ? picomatch(ignorePattern) : null

  return async (req, res, next) => {
    if (
      !req.url ||
      req.url.startsWith('/@') || // Ignore @fs @vite @react-refresh etc...
      req.url.startsWith('/__inspect/') // Ignore vite-plugin-inspect
    )
      return next()

    const url = new URL(req.url, 'relative:///').pathname

    if (ignoreMatcher && ignoreMatcher(url)) return next()

    const reqAbsPath = path.posix.join(
      server.config.root,
      url,
      url.endsWith('/') ? 'index.html' : ''
    )

    const parsedReqAbsPath = path.posix.parse(reqAbsPath)

    if (parsedReqAbsPath.ext !== '.html') return next()

    if (fs.existsSync(reqAbsPath)) return next()

    const pugAbsPath = path.posix.format({
      dir: parsedReqAbsPath.dir,
      name: parsedReqAbsPath.name,
      ext: '.pug',
    })

    if (!fs.existsSync(pugAbsPath))
      return send(req, res, '404 Not Found', 'html', {})

    const compileResult = await compilePug(
      server.moduleGraph,
      url,
      pugAbsPath,
      options,
      locals
    )

    // Pug compile error
    if (compileResult instanceof Error) return next(compileResult)

    const transformResult = await server.transformRequest(url, {
      html: true,
    })

    if (transformResult) {
      const html = await server.transformIndexHtml(url, transformResult.code)
      return send(req, res, html, 'html', {})
    }

    // transformResult is null
    // or Error occurred but Pug compiler doesn't return Error object
    return next(new Error('An unexpected error has occurred.'))
  }
}

export const vitePluginPugServe = (settings: ServeSettings): Plugin => {
  const { reload } = settings
  let server: ViteDevServer

  return {
    name: 'vite-plugin-pug-serve',
    enforce: 'pre',
    apply: 'serve',
    configureServer(_server) {
      server = _server

      server.middlewares.use(middleware(settings, server))
    },
    handleHotUpdate(context) {
      const fileModules = server.moduleGraph.getModulesByFile(context.file)

      if (fileModules) {
        fileModules.forEach((fileModule) => {
          fileModule.importers.forEach((importer) => {
            if (importer.file && path.extname(importer.file) === '.pug')
              server.moduleGraph.invalidateModule(importer)
          })
        })
      }

      if (reload !== false) {
        context.server.ws.send({ type: 'full-reload' })
      }
    },
  }
}

import fs from 'fs'
import path from 'path'
import { URL } from 'url'

import type Pug from 'pug'
import type { Plugin, ViteDevServer } from 'vite'
import { send } from 'vite'
import type Picomatch from 'picomatch'
import picomatch from 'picomatch'

import { compilePug } from './pug'

/**
 * @param options - Pug options
 * @param locals - Pug locals object
 * @param ignorePattern - Ignore patterns for converting HTML to Pug
 * @param reload - Reload settings (Currently, only enable/disable control)
 */
interface ServeSettings {
  options: Pug.Options | undefined
  locals: Pug.LocalsObject | undefined
  ignorePattern: Picomatch.Glob | undefined
  reload: boolean | undefined
}

export const vitePluginPugServe = (settings: ServeSettings): Plugin => {
  const { options, locals, ignorePattern, reload } = settings
  const ignoreMatcher = ignorePattern ? picomatch(ignorePattern) : null
  let server: ViteDevServer

  return {
    name: 'vite-plugin-pug-serve',
    enforce: 'pre',
    apply: 'serve',
    configureServer(_server) {
      server = _server

      server.middlewares.use(async (req, res, next) => {
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

        if (parsedReqAbsPath.ext === '.html') {
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
            return send(
              req,
              res,
              await server.transformIndexHtml(url, transformResult.code),
              'html',
              {}
            )
          }

          // transformResult is null
          // or Error occurred but Pug compiler doesn't return Error object
          return next(new Error('An unexpected error has occurred.'))
        }
        return next()
      })
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

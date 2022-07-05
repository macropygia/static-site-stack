import fs from 'fs'
import path from 'path'

import type Pug from 'pug'
import { compileFile } from 'pug'
import type { Plugin } from 'vite'
import { createLogger } from 'vite'
import ansis from 'ansis'

/**
 * @param options - Pug compile options
 * @param locals - Pug locals object
 */
interface BuildSettings {
  options: Pug.Options | undefined
  locals: Pug.LocalsObject | undefined
}

export const vitePluginPugBuild = (settings: BuildSettings): Plugin => {
  const { options, locals } = settings
  const pathMap = new Map<string, string>()
  const logger = createLogger()

  return {
    name: 'vite-plugin-pug-build',
    enforce: 'pre',
    apply: 'build',
    resolveId(source: string) {
      const parsedPath = path.parse(source)
      if (parsedPath.ext === '.pug') {
        const pathAsHtml = path.format({
          dir: parsedPath.dir,
          name: parsedPath.name,
          ext: '.html',
        })
        pathMap.set(pathAsHtml, source)
        return pathAsHtml
      }
      return null
    },
    load(id: string) {
      if (path.extname(id) === '.html') {
        if (pathMap.has(id)) {
          const compiledTemplate = compileFile(pathMap.get(id)!, options)
          const html = compiledTemplate(locals)
          logger.info(
            ansis.cyanBright('[vite-plugin-pug-static] ') +
              ansis.green('compiled: ') +
              ansis.yellow(path.relative(process.cwd(), pathMap.get(id)!))
          )
          return html
        }
        return fs.readFileSync(id, 'utf-8')
      }
      return null
    },
  }
}

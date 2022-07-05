import type Pug from 'pug'
import type Picomatch from 'picomatch'

import { vitePluginPugBuild } from './build.js'
import { vitePluginPugServe } from './serve.js'

interface Settings {
  buildOptions?: Pug.Options
  serveOptions?: Pug.Options
  locals?: Pug.LocalsObject
  ignorePattern?: Picomatch.Glob
  reload?: boolean
}

const defaultSettings: Settings = {}

const vitePluginPugStatic = (userSettings?: Settings) => {
  const settings: Settings = {
    ...defaultSettings,
    ...userSettings,
  }

  const { buildOptions, serveOptions, locals, ignorePattern, reload } = settings

  return [
    vitePluginPugBuild({
      options: buildOptions,
      locals,
    }),
    vitePluginPugServe({
      options: serveOptions,
      locals,
      ignorePattern,
      reload,
    }),
  ]
}

export default vitePluginPugStatic

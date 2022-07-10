import type Pug from 'pug'
import type Picomatch from 'picomatch'

import { vitePluginPugBuild } from './build.js'
import { vitePluginPugServe } from './serve.js'

interface Settings {
  buildOptions?: Pug.Options
  buildLocals?: Pug.LocalsObject
  serveOptions?: Pug.Options
  serveLocals?: Pug.LocalsObject
  ignorePattern?: Picomatch.Glob
  reload?: boolean
}

const defaultSettings: Settings = {}

const vitePluginPugStatic = (userSettings?: Settings) => {
  const settings: Settings = {
    ...defaultSettings,
    ...userSettings,
  }

  const {
    buildOptions,
    buildLocals,
    serveOptions,
    serveLocals,
    ignorePattern,
    reload,
  } = settings

  return [
    vitePluginPugBuild({
      options: buildOptions,
      locals: buildLocals,
    }),
    vitePluginPugServe({
      options: serveOptions,
      locals: serveLocals,
      ignorePattern,
      reload,
    }),
  ]
}

export default vitePluginPugStatic

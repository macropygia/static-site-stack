import type Pug from 'pug'
import type Picomatch from 'picomatch'
import { vitePluginPugBuild } from './libs/build.js'
import { vitePluginPugServe } from './libs/serve.js'

interface Settings {
  buildOptions?: Pug.Options
  serveOptions?: Pug.Options
  locals?: Pug.LocalsObject
  ignorePattern?: Picomatch.Glob
}

const defaultSettings: Settings = {}

const vitePluginPugStatic = (userSettings?: Settings) => {
  const settings: Settings = {
    ...defaultSettings,
    ...userSettings,
  }

  return [
    vitePluginPugBuild(settings.buildOptions, settings.locals),
    vitePluginPugServe(
      settings.serveOptions,
      settings.locals,
      settings.ignorePattern
    ),
  ]
}

export default vitePluginPugStatic

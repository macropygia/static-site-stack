import path from 'path'

import type FastGlob from 'fast-glob'
import { sync } from 'fast-glob'
import type { Plugin, ResolvedConfig } from 'vite'

interface Settings {
  patterns: FastGlob.Pattern | FastGlob.Pattern[]
  options?: FastGlob.Options
  disableAlias: boolean
  homeAlias: string
  rootPrefix: string
  dirDelimiter: string
  filePrefix: string
}

export interface UserSettings {
  patterns: FastGlob.Pattern | FastGlob.Pattern[]
  options?: FastGlob.Options
  disableAlias?: boolean
  homeAlias?: string
  rootPrefix?: string
  dirDelimiter?: string
  filePrefix?: string
}

const defaultSettings: Settings = {
  patterns: '**/*.html',
  disableAlias: false,
  homeAlias: 'home',
  rootPrefix: 'root',
  dirDelimiter: '-',
  filePrefix: '_',
}

const vitePluginGlobInput = (userSettings: UserSettings): Plugin => {
  const settings: Settings = {
    ...defaultSettings,
    ...userSettings,
  }
  let config: ResolvedConfig
  const requiredFgOptions: FastGlob.Options = {
    absolute: true,
  }

  return {
    name: 'vite-plugin-glob-input',
    enforce: 'pre',
    apply: 'build',
    configResolved(resolvedConfig) {
      config = resolvedConfig
    },
    options: (options) => {
      const fgOptions = {
        ...settings.options,
        ...requiredFgOptions,
      }
      const targets = sync(settings.patterns, fgOptions)
      let { input } = options

      // If input is not set, respect disableAlias.
      if (!input || typeof input === 'string')
        input = settings.disableAlias ? [] : {}

      if (Array.isArray(input)) {
        options.input = [...input, ...targets]
        return options
      }

      for (const target of targets) {
        const parsedRelPath = path.parse(path.relative(config.root, target))
        if (parsedRelPath.dir === '') {
          if (parsedRelPath.name === 'index') {
            // root & index
            input[settings.homeAlias] = target
          } else {
            // root & not index
            input[
              settings.rootPrefix + settings.filePrefix + parsedRelPath.name
            ] = target
          }
        } else {
          const prefix = parsedRelPath.dir.replace(
            path.sep,
            settings.dirDelimiter
          )
          if (parsedRelPath.name === 'index') {
            // subdirectory & index
            input[prefix] = target
          } else {
            // subdirectory & not index
            input[prefix + settings.filePrefix + parsedRelPath.name] = target
          }
        }
      }
      options.input = input
      return options
    },
  }
}

export default vitePluginGlobInput

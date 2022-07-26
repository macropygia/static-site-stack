import path from 'path'

import type FastGlob from 'fast-glob'
import fg from 'fast-glob'
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

const convertFilesToInput = (
  settings: Settings,
  config: ResolvedConfig,
  input: Record<string, string>,
  targetFiles: string[]
): Record<string, string> => {
  targetFiles.forEach((targetFile) => {
    const parsedRelPath = path.parse(path.relative(config.root, targetFile))
    if (parsedRelPath.dir === '') {
      if (parsedRelPath.name === 'index') {
        // root & index
        input[settings.homeAlias] = targetFile
      } else {
        // root & not index
        input[settings.rootPrefix + settings.filePrefix + parsedRelPath.name] =
          targetFile
      }
    } else {
      const prefix = parsedRelPath.dir.replace(path.sep, settings.dirDelimiter)
      if (parsedRelPath.name === 'index') {
        // subdirectory & index
        input[prefix] = targetFile
      } else {
        // subdirectory & not index
        input[prefix + settings.filePrefix + parsedRelPath.name] = targetFile
      }
    }
  })

  return input
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
      const targetFiles = fg.sync(settings.patterns, fgOptions)
      let { input } = options

      // If input is not set, respect disableAlias.
      if (!input || typeof input === 'string')
        input = settings.disableAlias ? [] : {}

      if (Array.isArray(input)) options.input = [...input, ...targetFiles]
      else
        options.input = convertFilesToInput(
          settings,
          config,
          input,
          targetFiles
        )

      return options
    },
  }
}

export default vitePluginGlobInput

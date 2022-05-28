import path from 'path';

import type { Plugin } from 'vite';
import type Picomatch from 'picomatch';
import picomatch from 'picomatch';

export interface UserSettings {
  include: Picomatch.Glob | Picomatch.Matcher;
  exclude?: Picomatch.Glob | Picomatch.Matcher;
  useAbsPath?: boolean;
}

interface Settings {
  include: Picomatch.Glob | Picomatch.Matcher;
  exclude?: Picomatch.Glob | Picomatch.Matcher;
  useAbsPath: boolean;
}

const defaultSettings: Settings = {
  include: '**/_*.{sass,scss,less,styl}',
  useAbsPath: false,
};

const initMatcher = (
  pattern: Picomatch.Glob | Picomatch.Matcher | undefined
): Picomatch.Matcher | null => {
  if (pattern === undefined) return null;
  if (typeof pattern === 'string' || Array.isArray(pattern))
    return picomatch(pattern);
  return pattern;
};

const vitePluginImporterInvalidator = (userSettings: UserSettings): Plugin => {
  const settings: Settings = {
    ...defaultSettings,
    ...userSettings,
  };

  const includeMatcher = initMatcher(settings.include);
  const excludeMatcher = initMatcher(settings.exclude);

  return {
    name: 'vite-plugin-importer-invalidator',
    enforce: 'pre',
    apply: 'serve',
    handleHotUpdate(context) {
      for (const module of context.modules) {
        if (!module.file) continue;

        const targetPath = settings.useAbsPath
          ? module.file
          : path.relative(context.server.config.root, module.file);

        if (
          (includeMatcher && !includeMatcher(targetPath)) ||
          (excludeMatcher && excludeMatcher(targetPath))
        )
          continue;

        for (const importer of module.importers)
          context.server.moduleGraph.invalidateModule(importer);
      }
    },
  };
};

export default vitePluginImporterInvalidator;

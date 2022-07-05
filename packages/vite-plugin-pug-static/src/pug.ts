import path from 'path'

import type Pug from 'pug'
import { compileFile } from 'pug'
import type { ModuleGraph, ModuleNode } from 'vite'
import { createLogger } from 'vite'
import ansis from 'ansis'

interface CompiledTemplateWithDeps extends Pug.compileTemplate {
  dependencies: string[]
}

const logger = createLogger()

/**
 * @param moduleGraph - Module graph
 * @param compiledModule - The module of Pug that compiles to HTML
 * @param ancestors - The ancestors of compiledModule
 */
const reflectAncestorsIntoModuleMap = (
  moduleGraph: ModuleGraph,
  compiledModule: ModuleNode,
  ancestors: string[]
) => {
  // Add ancestors in module map
  const importedModules: Set<ModuleNode> = new Set() // Optional
  ancestors.forEach((ancestor) => {
    const ancestorModules = moduleGraph.getModulesByFile(ancestor)
    const ancestorModule =
      (ancestorModules && [...ancestorModules][0]) ||
      moduleGraph.createFileOnlyEntry(ancestor)
    ancestorModule.importers.add(compiledModule) // ToDo: 依存関係から削除された場合の処理
    importedModules.add(ancestorModule) // Optional
  })
  compiledModule.importedModules = importedModules // Optional
}

/**
 * @param server - ViteDevServer
 * @param url - Root relative path
 * @param pugPath - Posix path of Pug
 * @param options - Pug options
 * @param locals - Pug locals object
 */
export const compilePug = async (
  moduleGraph: ModuleGraph,
  url: string,
  pugPath: string,
  options?: Pug.Options,
  locals?: Pug.LocalsObject
): Promise<boolean | Error> => {
  const compiledModule =
    (await moduleGraph.getModuleByUrl(url)) ||
    (await moduleGraph.ensureEntryFromUrl(url))

  // Init when created
  if (compiledModule.file !== pugPath) {
    if (compiledModule.file)
      moduleGraph.fileToModulesMap.delete(compiledModule.file)
    compiledModule.file = pugPath
    moduleGraph.fileToModulesMap.set(pugPath, new Set([compiledModule]))
  }

  // If the module didn't be invalidated
  if (compiledModule.transformResult) return true

  // Start compiling
  const map = null

  try {
    const compiledTemplate = compileFile(
      pugPath,
      options
    ) as CompiledTemplateWithDeps

    // Get ancestors from Pug compiler
    const ancestors = compiledTemplate.dependencies
    if (ancestors.length)
      reflectAncestorsIntoModuleMap(moduleGraph, compiledModule, ancestors)

    // Generate HTML
    const code = compiledTemplate(locals)

    logger.info(
      ansis.cyanBright('[vite-plugin-pug-static] ') +
        ansis.green('compiled: ') +
        ansis.yellow(path.relative(process.cwd(), pugPath))
    )

    compiledModule.transformResult = { code, map }
  } catch (err: unknown) {
    if (err instanceof Error) return err
    return false
  }
  return true
}

import os from 'node:os'
import path from 'node:path'

import type Picomatch from 'picomatch'
import picomatch from 'picomatch'
import { createLogger } from 'vite'
import ansis from 'ansis'

const logger = createLogger()

export function initMatcher(
  pattern: Picomatch.Glob | Picomatch.Matcher | undefined,
): Picomatch.Matcher | false {
  if (pattern === undefined) return false
  if (typeof pattern === 'string' || Array.isArray(pattern))
    return picomatch(pattern)
  return pattern
}

export function outputLog(
  type: 'info' | 'warn' | 'warnOnce' | 'error',
  green?: string,
  yellow?: string,
  dim?: string,
) {
  return logger[type](
    ansis.cyanBright('[imagemin-cache]') +
      (green ? ansis.green(` ${green}`) : '') +
      (yellow ? ansis.yellow(` ${yellow}`) : '') +
      (dim ? ansis.dim(` ${dim}`) : ''),
  )
}

// Copy from Vite

// https://github.com/vitejs/vite/blob/b9511f1ed8e36a618214944c69e2de6504ebcb3c/packages/vite/src/node/utils.ts#L220
export const isWindows = os.platform() === 'win32'

// https://github.com/vitejs/vite/blob/b9511f1ed8e36a618214944c69e2de6504ebcb3c/packages/vite/src/node/utils.ts#L53-L55
export function slash(p: string): string {
  return p.replace(/\\/g, '/')
}

// https://github.com/vitejs/vite/blob/b9511f1ed8e36a618214944c69e2de6504ebcb3c/packages/vite/src/node/utils.ts#L224-L226
export function normalizePath(id: string): string {
  return path.posix.normalize(isWindows ? slash(id) : id)
}

// https://github.com/vitejs/vite/blob/b9511f1ed8e36a618214944c69e2de6504ebcb3c/packages/vite/src/node/config.ts#L460-L462
export function getResolvedRoot(root: string | undefined) {
  return normalizePath(root ? path.resolve(root) : process.cwd())
}

// https://github.com/vitejs/vite/blob/b9511f1ed8e36a618214944c69e2de6504ebcb3c/packages/vite/src/node/config.ts#L587-L593
export function getResolvedPublicDir(
  publicDir: string | false | undefined,
  resolvedRoot: string,
) {
  return publicDir !== false && publicDir !== ''
    ? path.resolve(
        resolvedRoot,
        typeof publicDir === 'string' ? publicDir : 'public',
      )
    : ''
}

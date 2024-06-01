import { createLogger } from 'vite'
import ansis from 'ansis'

const logger = createLogger()

export function outputLog(
  type: 'info' | 'warn' | 'warnOnce' | 'error',
  green?: string,
  yellow?: string,
  dim?: string,
) {
  return logger[type](
    ansis.cyanBright('[pug-static]') +
      (green ? ansis.green(` ${green}`) : '') +
      (yellow ? ansis.yellow(` ${yellow}`) : '') +
      (dim ? ansis.dim(` ${dim}`) : ''),
  )
}

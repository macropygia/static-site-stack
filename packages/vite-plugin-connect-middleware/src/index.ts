import type http from 'node:http'

import type { Connect, Plugin } from 'vite'

export type Middleware = (
  req: Connect.IncomingMessage,
  res: http.ServerResponse,
  next: Connect.NextFunction
) => void | http.ServerResponse | Promise<void | http.ServerResponse>

export type Settings =
  | Middleware
  | {
      dev?: Middleware
      preview?: Middleware
    }

const vitePluginConnectMiddlware = (settings: Settings): Plugin => {
  let devMiddleware: Middleware | undefined
  let previewMiddleware: Middleware | undefined
  if (typeof settings === 'function') {
    devMiddleware = settings
    previewMiddleware = settings
  } else {
    devMiddleware = settings.dev
    previewMiddleware = settings.preview
  }
  return {
    name: 'vite-plugin-connect-middleware',
    enforce: 'pre',
    apply: 'serve',
    configureServer(server) {
      if (devMiddleware) server.middlewares.use(devMiddleware)
    },
    configurePreviewServer(server) {
      if (previewMiddleware) server.middlewares.use(previewMiddleware)
    },
  }
}

export default vitePluginConnectMiddlware

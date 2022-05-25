import fs from 'fs';
import type Pug from 'pug';
import { compileFile } from 'pug';
import type { Plugin, ViteDevServer } from 'vite';
import { send } from 'vite';
import type Picomatch from 'picomatch';
import picomatch from 'picomatch';

const transformPugToHtml = (
  server: ViteDevServer,
  path: string,
  options?: Pug.Options,
  locals?: Pug.LocalsObject
) => {
  try {
    const compiledTemplate = compileFile(path, options);
    const html = compiledTemplate(locals);
    return server.transformIndexHtml(path, html);
  } catch (err: any) {
    console.error(err.message);
    return server.transformIndexHtml(path, `<pre>${err.message}</pre>`);
  }
};

export const vitePluginPugServe = (
  options?: Pug.Options,
  locals?: Pug.LocalsObject,
  ignorePattern?: Picomatch.Glob
): Plugin => {
  const shouldIgnore = ignorePattern ? picomatch(ignorePattern) : null;
  return {
    name: 'vite-plugin-pug-serve',
    enforce: 'pre',
    apply: 'serve',
    handleHotUpdate(context) {
      context.server.ws.send({
        type: 'full-reload',
      });
    },
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (
          !req.url ||
          req.url.includes('__inspect') || // Through vite-plugin-inspect
          (shouldIgnore && shouldIgnore(req.url))
        )
          return next();

        const reqAbsPath =
          server.config.root +
          req.url +
          (req.url.endsWith('/') ? 'index.html' : '');

        if (reqAbsPath.endsWith('.html')) {
          if (fs.existsSync(reqAbsPath)) return next();

          const pugAbsPath = `${
            reqAbsPath.slice(0, Math.max(0, reqAbsPath.lastIndexOf('.'))) ||
            reqAbsPath
          }.pug`;

          if (!fs.existsSync(pugAbsPath))
            return send(req, res, '404 Not Found', 'html', {});

          const html = await transformPugToHtml(
            server,
            pugAbsPath,
            options,
            locals
          );
          return send(req, res, html, 'html', {});
        }
        return next();
      });
    },
  };
};

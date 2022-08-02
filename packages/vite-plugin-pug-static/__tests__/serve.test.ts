import path from 'node:path'

import fse from 'fs-extra'
import axios, { AxiosError } from 'axios'
import { beforeAll, afterAll, describe, test, expect } from 'vitest'
import { createServer, ViteDevServer } from 'vite'
import type { UserConfig } from 'vite'

import pugPlugin from '../src/index.js'

const srcdir = path.resolve(__dirname, 'src')
const distdir = path.resolve(__dirname, 'dist')

const config: UserConfig = {
  root: srcdir,
  build: {
    outDir: distdir,
    emptyOutDir: true,
    rollupOptions: {
      input: {
        home: '__tests__/src/index.pug',
      },
    },
  },
  plugins: [
    pugPlugin({
      buildOptions: { basedir: srcdir },
      buildLocals: { mode: 'build' },
      serveOptions: { basedir: srcdir },
      serveLocals: { mode: 'serve' },
      ignorePattern: ['/ignore/**'],
      reload: true,
    }),
  ],
}

let server: ViteDevServer

beforeAll(async () => {
  server = await createServer(config)
  await server.listen()
  // server.printUrls()
})

afterAll(async () => {
  server.close()
})

describe('serve', () => {
  test('get /', async () => {
    await axios.get('http://localhost:5173/').then((res) => {
      expect(res.data).toMatchInlineSnapshot(`
          "<!DOCTYPE html><html><head>
            <script type=\\"module\\" src=\\"/@vite/client\\"></script>
          </head><body><h1>serve</h1><p>partial</p></body></html>"
        `)
    })
  })
  test('get /index.html', async () => {
    await axios.get('http://localhost:5173/index.html').then((res) => {
      expect(res.data).toMatchInlineSnapshot(`
          "<!DOCTYPE html><html><head>
            <script type=\\"module\\" src=\\"/@vite/client\\"></script>
          </head><body><h1>serve</h1><p>partial</p></body></html>"
        `)
    })
  })
  test('get /html/index.html', async () => {
    await axios.get('http://localhost:5173/html/index.html').then((res) => {
      expect(res.data).toMatchInlineSnapshot(`
          "<!DOCTYPE html>
          <html>
          <head>
            <script type=\\"module\\" src=\\"/@vite/client\\"></script>

          </head>
          <body>
          <p>html</p>
          </body>
          </html>
          "
        `)
    })
  })
  test('get /nothtml.jpg', async () => {
    await axios
      .get('http://localhost:5173/nothtml.jpg')
      .catch((err: unknown) => {
        if (err instanceof AxiosError) expect(err.response?.status).toBe(404)
      })
  })
  test('get /ignore/', async () => {
    await axios.get('http://localhost:5173/ignore/').catch((err: unknown) => {
      if (err instanceof AxiosError) expect(err.response?.status).toBe(404)
    })
  })
  test('get /notfound/', async () => {
    await axios.get('http://localhost:5173/notfound/').catch((err: unknown) => {
      if (err instanceof AxiosError) expect(err.response?.status).toBe(404)
    })
  })
  test('get /invalid/', async () => {
    await axios.get('http://localhost:5173/invalid/').catch((err: unknown) => {
      if (err instanceof AxiosError)
        expect(err.response?.data).toMatchInlineSnapshot(`
            "
                    <!DOCTYPE html>
                    <html lang=\\"en\\">
                      <head>
                        <meta charset=\\"UTF-8\\" />
                        <title>Error</title>
                        <script type=\\"module\\">
                          import { ErrorOverlay } from '/@vite/client'
                          document.body.appendChild(new ErrorOverlay({\\"message\\":\\"/home/macropygia/static-site-stack/packages/vite-plugin-pug-static/__tests__/src/invalid/index.pug:5:7\\\\n    3|   head\\\\n    4|   body\\\\n  > 5|     h1あ\\\\n-------------^\\\\n    6| \\\\n\\\\nunexpected text \\\\\\"あ\\\\n\\\\\\"\\",\\"stack\\":\\"    at makeError (/home/macropygia/static-site-stack/node_modules/.pnpm/pug-error@2.0.0/node_modules/pug-error/index.js:34:13)\\\\n    at Lexer.error (/home/macropygia/static-site-stack/node_modules/.pnpm/pug-lexer@5.0.1/node_modules/pug-lexer/index.js:62:15)\\\\n    at Lexer.fail (/home/macropygia/static-site-stack/node_modules/.pnpm/pug-lexer@5.0.1/node_modules/pug-lexer/index.js:1629:10)\\\\n    at Lexer.advance (/home/macropygia/static-site-stack/node_modules/.pnpm/pug-lexer@5.0.1/node_modules/pug-lexer/index.js:1694:12)\\\\n    at Lexer.callLexerFunction (/home/macropygia/static-site-stack/node_modules/.pnpm/pug-lexer@5.0.1/node_modules/pug-lexer/index.js:1647:23)\\\\n    at Lexer.getTokens (/home/macropygia/static-site-stack/node_modules/.pnpm/pug-lexer@5.0.1/node_modules/pug-lexer/index.js:1706:12)\\\\n    at lex (/home/macropygia/static-site-stack/node_modules/.pnpm/pug-lexer@5.0.1/node_modules/pug-lexer/index.js:12:42)\\\\n    at Object.lex (/home/macropygia/static-site-stack/node_modules/.pnpm/pug@3.0.2/node_modules/pug/lib/index.js:104:9)\\\\n    at Function.loadString [as string] (/home/macropygia/static-site-stack/node_modules/.pnpm/pug-load@3.0.0/node_modules/pug-load/index.js:53:24)\\\\n    at compileBody (/home/macropygia/static-site-stack/node_modules/.pnpm/pug@3.0.2/node_modules/pug/lib/index.js:82:18)\\",\\"frame\\":\\"\\"}))
                        </script>
                      </head>
                      <body>
                      </body>
                    </html>
                  "
          `)
    })
  })
  test('get /__inspect/', async () => {
    await axios
      .get('http://localhost:5173/__inspect/')
      .catch((err: unknown) => {
        if (err instanceof AxiosError) expect(err.response?.status).toBe(404)
      })
  })
  test('get modified /', async () => {
    await fse.outputFile(path.join(srcdir, `_partial.pug`), 'p test')
    await axios
      .get('http://localhost:5173/')
      .then(async (res) => {
        expect(res.data).toMatchInlineSnapshot(`
          "<!DOCTYPE html><html><head>
            <script type=\\"module\\" src=\\"/@vite/client\\"></script>
          </head><body><h1>serve</h1><p>test</p></body></html>"
        `)
      })
      .finally(async () => {
        await fse.outputFile(path.join(srcdir, `_partial.pug`), 'p partial')
      })
  })
})

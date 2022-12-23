import path from 'node:path'

import fse from 'fs-extra'
import { beforeAll, afterAll, describe, test, expect } from 'vitest'
import { build } from 'vite'
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
        foo: '__tests__/src/html/index.html',
        bar: '__tests__/src/sample.ts',
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

beforeAll(async () => {
  await build(config)
})

afterAll(async () => {
  await fse.remove(distdir)
})

describe('build', async () => {
  test('get root', async () => {
    expect(
      await fse.readFile(path.join(distdir, 'index.html'), 'utf-8')
    ).toMatchInlineSnapshot(
      '"<!DOCTYPE html><html><head></head><body><h1>build</h1><p>partial</p></body></html>"'
    )
  })
  test('get subdir', async () => {
    expect(await fse.readFile(path.join(distdir, 'html/index.html'), 'utf-8'))
      .toMatchInlineSnapshot(`
      "<!DOCTYPE html>
      <html>
      <head>
      </head>
      <body>
      <p>html</p>
      </body>
      </html>
      "
    `)
  })
  test('get asset', async () => {
    expect(
      await fse.readFile(path.join(distdir, 'assets/bar-6f3c22b9.js'), 'utf-8')
    ).toMatchInlineSnapshot(`
      "console.log(\\"bar\\");
      "
    `)
  })
})

import imagemin from 'imagemin'
import imageminPngquant from 'imagemin-pngquant'
import imageminOptipng from 'imagemin-optipng'
import imageminMozjpeg from 'imagemin-mozjpeg'
import imageminSvgo from 'imagemin-svgo'
// import imageminWebp from 'imagemin-webp'

import type { ImageminSettings } from './types.js'

async function imageProcessor(settings: ImageminSettings, buffer: Buffer) {
  const plugins = []
  if (settings.pngquant !== false)
    plugins.push(imageminPngquant(settings.pngquant))
  if (settings.optipng !== false)
    plugins.push(imageminOptipng(settings.optipng))
  if (settings.mozjpeg !== false)
    plugins.push(imageminMozjpeg(settings.mozjpeg))
  // NOTE: Wait for imagemin-svgo v11.x to be fixed
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  if (settings.svgo !== false) plugins.push(imageminSvgo(settings.svgo))
  // if (settings.webp !== false) plugins.push(imageminWebp(settings.webp))

  try {
    return await imagemin.buffer(buffer, {
      plugins,
    })
  } catch (err: any) {
    return false
  }
}

export { imageProcessor }

import path from 'path'

import fse from 'fs-extra'

import type { Context } from './types.js'

export async function processCache(ctx: Context, now: number) {
  const { config, cacheDb } = ctx

  cacheDb.countdown()

  if (config.asset.useCrc) {
    // Static asset without hash
    for (const [fileName, checksum] of ctx.assetHashMap)
      cacheDb.upsertPublic(fileName, checksum, now)
  } else {
    // Static asset with hash
    cacheDb.renewAsset(ctx.assetTargets, now)
    cacheDb.insertAsset(ctx.assetTargets, now)
  }

  for (const [fileName, checksum] of ctx.publicHashMap)
    cacheDb.upsertPublic(fileName, checksum, now)

  // Delete expired cache files
  const expiredFiles = cacheDb.getExpired(now)
  await Promise.all(
    expiredFiles.map((file): Promise<void> => {
      return fse.remove(path.join(config.cacheDir, file.fileName))
    })
  )
  cacheDb.removeExpired(now)

  cacheDb.close()
}

export default {
  '**/*': 'prettier --write --ignore-unknown',
  '**/*.{ts,d.ts,js,cjs,mjs}': 'eslint --fix',
  'packages/*/src/**/*.ts': (filenames) => {
    const updatedPackages = new Set()
    const reGetPackageName = /packages\/(?<packageName>.+)\/src/
    for (const filename of filenames) {
      const found = filename.match(reGetPackageName)
      updatedPackages.add(found.groups.packageName)
    }
    return `pnpm --filter ${[...updatedPackages].join(' --filter ')} type-check`
  },
}

import url from 'url'

import MagicString from 'magic-string'

export function cachebuster(code: string, prefix: string | true): string {
  const assetUrlRE = /__VITE_ASSET__([a-z0-9]{8})__(?:\$_(.*?)__)?/g

  let match: RegExpExecArray | null
  let s: MagicString | undefined

  while ((match = assetUrlRE.exec(code))) {
    s = s || (s = new MagicString(code))
    const [full, hash, postfix = ''] = match
    const replacementString = `__VITE_ASSET__${hash}__$_${updatePostfix(
      postfix,
      typeof prefix === 'string' ? prefix : '?',
      hash!
    )}__`
    s.overwrite(match.index, match.index + full!.length, replacementString, {
      contentOnly: true,
    })
  }
  return s ? s.toString() : code
}

function updatePostfix(postfix: string, prefix: string, hash: string): string {
  // ref. https://github.com/nodejs/node/issues/25099
  /* eslint-disable n/no-deprecated-api */
  const parsedPostfix = url.parse(postfix)
  parsedPostfix.search = parsedPostfix.search
    ? `${prefix}${hash}&${parsedPostfix.search.slice(1)}`
    : prefix + hash
  return url.format(parsedPostfix)
  /* eslint-enable n/no-deprecated-api */
}

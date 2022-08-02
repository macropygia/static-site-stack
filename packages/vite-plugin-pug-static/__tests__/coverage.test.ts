import { test } from 'vitest'

import { outputLog } from '../src/utils.js'

test('outputLog', async () => {
  outputLog('info', '', '', 'dim')
  outputLog('info', 'green', 'yellow', '')
})

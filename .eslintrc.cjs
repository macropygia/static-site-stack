/* eslint-disable @typescript-eslint/no-var-requires, n/no-unpublished-require */
const { defineConfig } = require('eslint-define-config')

module.exports = defineConfig({
  root: true,
  env: {
    es2021: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:n/recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier',
  ],
  parserOptions: {
    ecmaVersion: 'latest',
  },
  rules: {
    // ref. https://github.com/weiran-zsd/eslint-plugin-node#readme
    'n/no-missing-import': 0,
    'n/no-unsupported-features/es-syntax': 0,
    // for Map
    // '@typescript-eslint/no-non-null-assertion': 0,
  },
})

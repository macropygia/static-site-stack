// @ts-check
const { defineConfig } = require('eslint-define-config') // eslint-disable-line

module.exports = defineConfig({
  root: true,
  env: {
    es2021: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:import/recommended',
    'plugin:n/recommended',
    'prettier',
  ],
  plugins: ['eslint-plugin-tsdoc'],
  parserOptions: {
    ecmaVersion: 'latest',
  },
  settings: {
    'import/parsers': {
      '@typescript-eslint/parser': ['.ts'],
    },
    'import/resolver': {
      typescript: {
        alwaysTryTypes: true,
        project: 'packages/*/tsconfig.json',
      },
    },
  },
  rules: {
    // Required settings
    'n/no-unsupported-features/es-syntax': 'off', // Required to use import
    // eslint-plugin-import
    'import/order': ['error', { 'newlines-between': 'always' }], // Required to use autofix
    'import/no-named-as-default-member': 'off', // When building a subproject with dual packages, some packages will not load if this option is satisfied.
    // eslint-import-resolver-typescript
    'import/no-unresolved': 'error', // Enable main feature
    // eslint-plugin-tsdoc
    'tsdoc/syntax': 'warn', // Required to use autofix

    // Optional settings
    // for Map
    '@typescript-eslint/no-non-null-assertion': 'off',
    // loosen
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-empty-interface': 'off',
  },
  overrides: [
    {
      files: ['packages/*/__tests__/**/*.{js,cjs,mjs,ts}', 'vitest.config.ts'],
      env: { node: true },
      rules: {
        'import/no-extraneous-dependencies': 'off',
        'n/no-extraneous-import': 'off',
        'no-console': 'off',
      },
    },
  ],
})

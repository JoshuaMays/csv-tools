//  @ts-check

import { tanstackConfig } from '@tanstack/eslint-config'
import prettierPlugin from 'eslint-plugin-prettier/recommended'

export default [
  ...tanstackConfig,
  {
    rules: {
      'import/no-cycle': 'off',
      'import/order': 'off',
      'sort-imports': 'off',
      '@typescript-eslint/array-type': 'off',
      '@typescript-eslint/require-await': 'off',
    },
  },
  {
    ignores: ['eslint.config.js', 'prettier.config.js', 'src/paraglide/**', 'src/routeTree.gen.ts', 'terraform/**', 'public/csv-worker.js', 'public/validator-worker.js'],
  },
  prettierPlugin,
]

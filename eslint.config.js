import love from 'eslint-config-love'
import globals from 'globals'

export default [
  {
    ignores: [
      'lib/**',
      '.temp/**',
      'dist/**',
      'demo/**'
    ]
  },
  {
    ...love,
    files: [
      'src/**/*.ts',
      'src/**/*.tsx'
    ],
    languageOptions: {
      ...love.languageOptions,
      parserOptions: {
        ...love.languageOptions.parserOptions,
        ecmaFeatures: { jsx: true }
      },
      globals: {
        ...globals.node,
        ...globals.browser
      }
    },
    rules: {
      ...love.rules,
      '@typescript-eslint/brace-style': 'off',
      '@typescript-eslint/consistent-type-definitions': 'off',
      '@typescript-eslint/no-magic-numbers': 'off',
      '@typescript-eslint/no-confusing-void-expression': 'off',
      '@typescript-eslint/prefer-destructuring': 'off',
      '@typescript-eslint/restrict-template-expressions': 'off',
      curly: 'off',
      'operator-linebreak': [
        'error',
        'before',
        { overrides: { '=': 'none' } }
      ],
      'quote-props': 'off',
      radix: 'off'
    }
  }
]

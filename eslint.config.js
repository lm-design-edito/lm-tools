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
      '@eslint-community/eslint-comments/require-description': 'off',
      '@typescript-eslint/brace-style': 'off',
      '@typescript-eslint/consistent-indexed-object-style': 'off',
      '@typescript-eslint/consistent-type-definitions': 'off',
      '@typescript-eslint/init-declarations': 'off',
      '@typescript-eslint/max-params': 'off',
      '@typescript-eslint/no-magic-numbers': 'off',
      '@typescript-eslint/no-confusing-void-expression': 'off',
      '@typescript-eslint/no-unnecessary-type-arguments': 'off',
      '@typescript-eslint/only-throw-error': 'off',
      '@typescript-eslint/prefer-destructuring': 'off',
      '@typescript-eslint/prefer-optional-chain': 'off',
      '@typescript-eslint/prefer-regexp-exec': 'off',
      '@typescript-eslint/restrict-template-expressions': 'off',
      'arrow-body-style': 'off',
      complexity: 'off',
      curly: 'off',
      // Un fichier long n'est pas un défaut en soi, et le seuil ne sait pas distinguer
      // quatre cents lignes de logique d'un composant richement commenté. Déporter du
      // code pour satisfaire un compteur produit des modules qui n'existent que pour
      // ça — voir « Module layout » dans CLAUDE.md.
      'max-lines': 'off',
      'operator-assignment': 'off',
      'operator-linebreak': [
        'error',
        'before',
        { overrides: { '=': 'none' } }
      ],
      'no-await-in-loop': 'off',
      'no-negated-condition': 'off',
      'prefer-exponentiation-operator': 'off',
      'prefer-named-capture-group': 'off',
      'promise/avoid-new': 'off',
      'quote-props': 'off',
      radix: 'off'
    }
  }
]

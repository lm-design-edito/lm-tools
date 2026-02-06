module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: [
      './src/agnostic/tsconfig.json',
      './src/node/tsconfig.json',
      './src/components/tsconfig.json'
    ],
    tsconfigRootDir: __dirname,
    ecmaFeatures: {
      jsx: true
    }
  },
  extends: ['standard-with-typescript'],
  env: {
    node: true,
    browser: true
  },
  rules: {
    '@typescript-eslint/consistent-type-definitions': 'off',
    '@typescript-eslint/no-confusing-void-expression': 'off',
    'curly': 'off',
    'operator-linebreak': ['error', 'before', { 'overrides': { '=': 'none' } }]
  }
}

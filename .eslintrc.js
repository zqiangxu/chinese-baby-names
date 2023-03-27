module.exports = {
  extends: [
    'prettier',
    'eslint:recommended',
    'plugin:prettier/recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/eslint-recommended',
  ],
  parserOptions: {
    ecmaVersion: 'latest',
  },
  plugins: ['prettier', '@typescript-eslint'],
  env: {
    node: true,
    es6: true,
    commonjs: true,
  },
  plugins: [],
  globals: {},
  rules: {
    'no-console': 'error',
    'prettier/prettier': 'error',
    quotes: ['error', 'single'],
  },
};

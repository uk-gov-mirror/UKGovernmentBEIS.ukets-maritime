// @ts-check
const tseslint = require('typescript-eslint');
const rootConfig = require('../../eslint.config.js');

module.exports = tseslint.config(...rootConfig, {
  languageOptions: {
    parserOptions: {
      project: ['./tsconfig.lib.json'],
      tsconfigRootDir: __dirname,
    },
  },
  files: ['**/*.ts'],
  rules: {
    'no-control-regex': 'off',
    'no-useless-escape': 'off',
    '@typescript-eslint/ban-types': 'off',
    '@typescript-eslint/no-restricted-imports': 'off',
    '@typescript-eslint/no-empty-object-type': 'off',
    '@angular-eslint/prefer-inject': 'off',
  },
});

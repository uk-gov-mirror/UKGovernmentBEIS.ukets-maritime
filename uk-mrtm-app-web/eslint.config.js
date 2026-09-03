// @ts-check
const eslint = require('@eslint/js');
const tseslint = require('typescript-eslint');
const angular = require('angular-eslint');
const prettierConfig = require('eslint-config-prettier');
const prettierPlugin = require('eslint-plugin-prettier');
const simpleImportSortPlugin = require('eslint-plugin-simple-import-sort');
const unusedImportsPlugin = require('eslint-plugin-unused-imports');
const importPlugin = require('eslint-plugin-import');

module.exports = tseslint.config(
  {
    files: ['**/*.ts'],
    extends: [
      eslint.configs.recommended,
      ...tseslint.configs.recommended,
      ...angular.configs.tsRecommended,
      ...angular.configs.tsAll,
    ],
    processor: angular.processInlineTemplates,
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.app.json', './tsconfig.spec.json'],
        tsconfigRootDir: __dirname,
      },
    },
    plugins: {
      'simple-import-sort': simpleImportSortPlugin,
      'unused-imports': unusedImportsPlugin,
      prettier: prettierPlugin,
      import: importPlugin,
    },
    rules: {
      '@angular-eslint/use-component-view-encapsulation': ['warn'],
      '@angular-eslint/prefer-standalone': ['off'],
      '@angular-eslint/component-selector': [
        'error',
        {
          type: ['element', 'attribute'],
          prefix: 'mrtm',
          style: 'kebab-case',
        },
      ],
      '@angular-eslint/directive-selector': [
        'error',
        {
          type: 'attribute',
          prefix: 'mrtm',
          style: 'camelCase',
        },
      ],
      '@angular-eslint/component-max-inline-declarations': [
        'error',
        {
          template: 20,
          styles: 10,
        },
      ],
      '@angular-eslint/use-injectable-provided-in': 'off',
      '@angular-eslint/no-forward-ref': 'off',
      '@angular-eslint/prefer-standalone-component': 'off',
      '@typescript-eslint/no-inferrable-types': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': ['error', { ignoreRestSiblings: true }],
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      'import/no-duplicates': 'error',
      'simple-import-sort/imports': [
        'error',
        {
          groups: [
            ['(@angular)(/.*|$)'],
            ['(rxjs$)', '(^immer)', '(^date-fns)', '(^keycloak-js)', '(^@zxcvbn-ts)', '(^libphonenumber-js)(/.*)?'],
            ['(@mrtm/api)(/.*|$)'],
            ['(@netz/common)(/.*|$)', '(@netz/govuk-components)(/.*|$)'],
            ['()(/.*|$)'],
            ['(src)(/.*|$)'],
            ['^[.].*'],
          ],
        },
      ],
      'no-restricted-imports': 'off',
      '@typescript-eslint/no-unused-expressions': 'off',
      '@typescript-eslint/no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['./', '../'],
              message: 'Relative imports are not allowed.',
            },
          ],
        },
      ],
      'unused-imports/no-unused-imports': 'error',
      'sort-imports': 'off',
      'import/order': 'off',
      ...prettierConfig.rules,
      'prettier/prettier': 'error',
    },
  },
  {
    files: ['**/main.ts', '**/index.ts', '**/app*.ts'],
    rules: {
      '@typescript-eslint/no-restricted-imports': 'off',
    },
  },
  {
    files: ['**/*.spec.ts'],
    rules: {
      '@angular-eslint/component-max-inline-declarations': 'off',
      '@angular-eslint/prefer-on-push-component-change-detection': 'off',
      '@angular-eslint/use-component-selector': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@angular-eslint/no-lifecycle-call': 'off',
    },
  },
  {
    files: ['**/*.html'],
    extends: [...angular.configs.templateRecommended, ...angular.configs.templateAll],
    plugins: {
      prettier: prettierPlugin,
    },
    rules: {
      '@angular-eslint/template/conditional-complexity': [
        'error',
        {
          maxComplexity: 8,
        },
      ],
      '@angular-eslint/template/i18n': 'off',
      '@angular-eslint/template/cyclomatic-complexity': 'off',
      '@angular-eslint/template/no-call-expression': 'off',
      '@angular-eslint/template/no-any': 'off',
      '@angular-eslint/template/use-track-by-function': 'off',
      '@angular-eslint/template/attributes-order': 'off',
      '@angular-eslint/template/no-inline-styles': 'off',
      '@angular-eslint/template/accessibility-interactive-supports-focus': 'off',
      '@angular-eslint/template/no-interpolation-in-attributes': 'off',
      '@angular-eslint/template/prefer-self-closing-tags': 'error',
      '@angular-eslint/template/prefer-ngsrc': 'off',
      '@angular-eslint/template/prefer-control-flow': 'off',
      ...prettierConfig.rules,
      'prettier/prettier': [
        'error',
        {
          parser: 'angular',
        },
      ],
    },
  },
);

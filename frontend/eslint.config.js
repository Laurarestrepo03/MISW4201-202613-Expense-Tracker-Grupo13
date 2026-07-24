// @ts-check
const eslint = require('@eslint/js');
const { defineConfig } = require('eslint/config');
const tseslint = require('typescript-eslint');
const angular = require('angular-eslint');

module.exports = defineConfig([
  {
    files: ['**/*.ts'],
    extends: [
      eslint.configs.recommended,
      tseslint.configs.recommended,
      tseslint.configs.stylistic,
      angular.configs.tsRecommended,
    ],
    processor: angular.processInlineTemplates,
    rules: {
      // Gates de Code Health (docs/ARQUITECTURA.md §10)
      complexity: ['error', 8],
      'max-lines': ['error', 250],
      'max-lines-per-function': ['error', 30],
      'max-depth': ['error', 3],
      'max-params': ['error', 4],
      '@angular-eslint/directive-selector': [
        'error',
        {
          type: 'attribute',
          prefix: 'app',
          style: 'camelCase',
        },
      ],
      '@angular-eslint/component-selector': [
        'error',
        {
          type: 'element',
          prefix: 'app',
          style: 'kebab-case',
        },
      ],
    },
  },
  {
    // Los callbacks de describe() agregan las líneas de todos sus it();
    // el gate de 30 líneas por función aplica al código de producción.
    files: ['**/*.spec.ts'],
    rules: {
      'max-lines-per-function': 'off',
    },
  },
  {
    files: ['**/*.html'],
    extends: [angular.configs.templateRecommended, angular.configs.templateAccessibility],
    rules: {},
  },
]);

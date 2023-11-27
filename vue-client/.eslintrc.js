require('@rushstack/eslint-patch/modern-module-resolution');

const path = require('node:path');
const createAliasSetting = require('@vue/eslint-config-airbnb/createAliasSetting');

module.exports = {
  root: true,
  env: {
    node: true,
  },
  globals: {
    runtimeConfig: 'readonly',
  },
  extends: [
    'plugin:vue/vue3-essential',
    '@vue/eslint-config-airbnb',
    'plugin:cypress/recommended',
  ],
  ignorePatterns: [
    '**/node_modules/**',
  ],
  rules: {
    'no-use-before-define': 'off',
    'no-plusplus': 'off',
    'no-restricted-syntax': 'off',
    'no-console': 'off',
    'no-prototype-builtins': 'off',
    'prefer-destructuring': 'off',
    'prefer-object-spread': 'off',
    'no-underscore-dangle': 'off',
    'prefer-promise-reject-errors': 'off',
    'no-cond-assign': 'off',
    'object-shorthand': 'off',
    'import/no-cycle': 'off',
    'import/extensions': 'off',
    'no-param-reassign': 'off',
    'import/prefer-default-export': 'off',
    'import/no-dynamic-require': 'off',
    'import/no-extraneous-dependencies': 'off',
    'object-curly-newline': [
      'error',
      {
        ImportDeclaration: 'never',
      },
    ],
    'global-require': 'off',
    radix: 'off',
    'no-alert': 'off',
    'no-continue': 'off',
    'vue/max-len': ['error', {
      code: 150,
      template: 150,
      comments: 150,
    }],
    'vue/multi-word-component-names': ['error', {
      ignores: ['field', 'breadcrumb', 'spinner', 'notification', 'facet', 'sort', 'Find', 'Inspector', 'Login'],
    }],
  },
  settings: {
    ...createAliasSetting({
      '@': `${path.resolve(__dirname, './src')}`,
    }),
  },
  parser: 'vue-eslint-parser',
  parserOptions: {
    parser: '@babel/eslint-parser',
    allowImportExportEverywhere: true,
  },
};

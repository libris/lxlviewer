import js from "@eslint/js";
import globals from "globals";
import pluginVue from "eslint-plugin-vue";
import pluginCypress from 'eslint-plugin-cypress';
import { defineConfig } from "eslint/config";

export default defineConfig([
  {
    ignores: ["**/node_modules/**"],
  },
  {
    files: ["**/*.{js,mjs,cjs,vue}"],
    plugins: {js},
    extends: [
      "js/recommended"
    ],
    languageOptions: {
      globals: {
        ...globals.browser,
        runtimeConfig: 'readonly'
      }
    },
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
    }
  },
  pluginVue.configs["flat/essential"],
  pluginCypress.configs.recommended
]);




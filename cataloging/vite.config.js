import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import { resolve } from 'path';
import gitDescribe from 'git-describe';
import vue from '@vitejs/plugin-vue';
import autoprefixer from 'autoprefixer';

// https://vitejs.dev/config/
export default defineConfig({
  base: '/katalogisering/',
  plugins: [
    vue(),
  ],
  server: {
    port: 8080,
    host: true,
    fs: { // TODO: check if this is this needed?
      strict: false,
      allow: ['..'],
    },
  },
  define: {
    'import.meta.env.VITE_APP_GIT_DESCRIBE': JSON.stringify(gitDescribe.gitDescribeSync({
      longSemver: true,
      dirtySemver: false,
      requireAnnotated: false,
      match: '*',
    })),
    'import.meta.env.VITE_APP_VERSION': JSON.stringify(process.env.npm_package_version),
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '~bootstrap': resolve(__dirname, 'node_modules/bootstrap'),
      '~font-awesome': resolve(__dirname, 'node_modules/font-awesome'),
      '~kungbib-styles': resolve(__dirname, 'node_modules/kungbib-styles'),
      querystring: resolve(__dirname, 'node_modules/querystring-es3'), // SEE: https://github.com/mulesoft-labs/js-client-oauth2/issues/190
      crypto: resolve(__dirname, 'node_modules/crypto-browserify'),
      stream: resolve(__dirname, 'node_modules/stream-browserify'),
    },
    // TODO: remove entire row when we have ensured all SFC imports end with the .vue extension.
    // https://vueschool.io/articles/vuejs-tutorials/how-to-migrate-from-vue-cli-to-vite/
    extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.vue'],
  },
  test: { // vitest config
    globals: true, // enable jest-like global test APIs
    environment: 'happy-dom',
    setupFiles: ['/tests/unit/vitest-setup.js'],
  },
  css: {
    postcss: {
      plugins: [
        autoprefixer({}), // add options if needed
      ],
    },
    preprocessorOptions: {
      less: {
        includePaths: ['node_modules'],
        additionalData: `
          @import "@/styles/_variables.less";
          @import "@/styles/_mixins.less";
          @import "@/styles/_animate.less";
          @import "@/styles/_fonts.less";
          @import '@/styles/_icons.less';
          @import '@/styles/_utils.less';
          @import '@/styles/_globals.less';
        `,
      },
    },
  },
});

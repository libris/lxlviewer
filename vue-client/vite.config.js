import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import { resolve } from 'path';
import { gitDescribeSync } from 'git-describe'
import vue from '@vitejs/plugin-vue'

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
    __APP_GIT_DESCRIBE__: JSON.stringify(gitDescribeSync({
      longSemver: true,
      dirtySemver: false,
      requireAnnotated: false,
      match: '*',
    }))
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
    extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.vue'], // TODO: remove entire row when we have ensured all SFC imports end with the .vue extension. https://vueschool.io/articles/vuejs-tutorials/how-to-migrate-from-vue-cli-to-vite/
  },
  css: {
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
        `,
      },
    },
  }
})

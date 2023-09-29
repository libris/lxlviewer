import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';
import renameExtensions from '@betit/rollup-plugin-rename-extensions';

// https://vitejs.dev/config/
export default defineConfig({
  base: '/katalogisering/',

  plugins: [
    vue(),
    renameExtensions.default({
      mappings: {
          '.jsonld': '.json',
      },
    })
  ],
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
  },
  server: {
    port: 8080,
    host: true,
    fs: {
      strict: false,
      allow: ['..'],
    },
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '~bootstrap': resolve(__dirname, 'node_modules/bootstrap'),
      '~font-awesome': resolve(__dirname, 'node_modules/font-awesome'),

      // SEE: https://github.com/mulesoft-labs/js-client-oauth2/issues/190
      querystring: resolve(__dirname, 'node_modules/querystring-es3'),
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        includePaths: ['node_modules'],
        additionalData: `
          @import "~bootstrap/scss/_functions.scss";
          @import "~bootstrap/scss/_variables.scss";
          @import "~bootstrap/scss/mixins/_breakpoints.scss";
          @import "@/styles/_variables.scss";
          @import "@/styles/_mixins.scss";
        `,
      },
    },
  },
  build: {
    rollupOptions: {
      input: './src/main.ts',
    }
  }
})

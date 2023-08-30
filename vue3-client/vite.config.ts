import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';

// Matches opening and closing parenthesis across multiple lines
const multilineParenthesisRegex = '\\([\\s\\S]*?\\);?';
// Finds any @use statement
const useRegex = `^@use \\S*(?: with ${multilineParenthesisRegex}|.*)?\n?$`;
// Same as above, but adds the m (multiline) flag
const useRegexTest = new RegExp(useRegex, 'm');
// Makes sure that only the last instance of `useRegex` variable is found
const useRegexReplace = new RegExp(`${useRegex}(?![\\s\\S]*${useRegex})`, 'gm');

function hoistUseStatements(resources: string): (key: string) => string {
    // De-duplicate identical imports
    return function(source: string): string {
        if (useRegexTest.test(source)) {
            const output = source.replace(
                useRegexReplace,
                (useStatements) => `${useStatements}\n${resources}`,
            );

            const importedResources: Record<string, boolean | undefined> = {};
            return output.replace(new RegExp(useRegex, 'mg'), (importedResource: string) => {
                if (importedResources[importedResource]) {
                    return '';
                }

                importedResources[importedResource] = true;
                return importedResource;
            });
        }

        return `${resources}\n${source}`;
    }
};

const SPLIT_CSS_MARK = '/* ##SPLIT_CSS_MARK## */'
const imports = `
@import "~bootstrap/scss/bootstrap.scss";
@import "@/styles/main.scss";
` + SPLIT_CSS_MARK;

// https://vitejs.dev/config/
export default defineConfig({
  base: '/katalogisering/',

  plugins: [
    vue(),
    {
      // ⚙️ custom plugin to remove duplicated css caused by css.preprocessorOptions.scss.additionalData
      name: 'vite-plugin-strip-css',
      transform(src: string, id) {
        if (id.endsWith('.vue') && !id.includes('node_modules') && src.includes('@extend')) {
          console.warn(
            'You are using @extend in your component. This is likely not working in your styles. Please use mixins instead.',
            id.replace(`${projectRootDir}/`, '')
          )
        }

        if (id.includes('.scss')) {
          if (id.includes('bootstrap.scss')) {
            // Keep the common file only in root css file
            return { code: src, map: null }
          }

          const split = src.split(SPLIT_CSS_MARK)
          const newSrc = split[split.length - 1]
          return { code: newSrc, map: null }
        }
      },
    },
  ],
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
  },
  server: {
    port: 8080,
    host: true,
    fs: {
      allow: ['..'],
    },
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '~bootstrap': resolve(__dirname, 'node_modules/bootstrap'),
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
  // css: {
  //   preprocessorOptions: {
  //     scss: {
  //       javascriptEnabled: true,
  //       modifyVars: {
  //         'root-entry-name': 'default',
  //       },
  //     },
  //     less: {
  //       javascriptEnabled: true,
  //       modifyVars: {
  //         'root-entry-name': 'default',
  //       },
  //     }
  //   }
  // },
  build: {
    rollupOptions: {
      input: './src/main.ts',
    }
  }
})

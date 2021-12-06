const { gitDescribeSync } = require('git-describe');
import envComputer from './plugins/env.js';
const HOST_PATH = envComputer(process.env.ENV);
process.env.APP_VERSION = require('./package.json').version;

process.env.GIT_DESCRIBE = JSON.stringify(gitDescribeSync({
  longSemver: true,
  dirtySemver: false,
  requireAnnotated: false,
  match: '*',
}));

export default {
  // Global page headers: https://go.nuxtjs.dev/config-head
  head: {
    title: 'id.kb.se',
    htmlAttrs: {
      lang: 'sv'
    },
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: 'Grundstenar för länkade data hos Kungliga biblioteket.' },
      { hid:'og:title', property:'og:title', content:'id.kb.se' },
      { hid:'og:site_name', property:'og:site_name', content:'id.kb.se' },
      { hid:'og:description', property:'og:description', content:'Grundstenar för länkade data hos Kungliga biblioteket.' },
      { hid:'og:image', property:'og:image', content:`${HOST_PATH}/opengraph_id.png` },
      { hid:'og:image:width', property:'og:image:width', content:'1200' },
      { hid:'og:image:height', property:'og:image:height', content:'600' },
      { hid:'twitter:image', property:'twitter:image', content:`${HOST_PATH}/opengraph_id.png` },
      { hid:'twitter:card', name:'twitter:card', content:'summary_large_image' },
    ],
    link: [
      { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
    ]
  },

  // Global CSS: https://go.nuxtjs.dev/config-css
  css: [
    '~/assets/scss/main.scss',
  ],

  // Plugins to run before rendering page: https://go.nuxtjs.dev/config-plugins
  plugins: [
    '~plugins/filters.js',
    '~mixins/lxl.js',
  ],

  router: {
    middleware: ['marc'],
  },

  // Auto import components: https://go.nuxtjs.dev/config-components
  components: false,

  parallel: true,
  
  // Modules for dev and build (recommended): https://go.nuxtjs.dev/config-modules
  buildModules: [
    '@nuxtjs/dotenv'
  ],

  // Modules: https://go.nuxtjs.dev/config-modules
  modules: [
    '@nuxtjs/style-resources',
    '@nuxt/http',
  ],

  styleResources: {
    hoistUseStatements: true,
    scss: [
      '~/assets/scss/_variables.scss',
      '~/node_modules/kungbib-styles/lib/scss/_variables.scss',
      '~/node_modules/bootstrap/scss/_functions.scss',
      '~/node_modules/bootstrap/scss/_variables.scss',
      '~/node_modules/bootstrap/scss/_mixins.scss',
      '~/node_modules/bootstrap/scss/_containers.scss',
      '~/node_modules/bootstrap/scss/_grid.scss'
    ],
  },

  publicRuntimeConfig: {
    apiPath: process.env.API_PATH || 'http://localhost:5000',
    siteName: 'id.kb.se',
    environment: process.env.ENV,
  },

  privateRuntimeConfig: {
  },

  // Build Configuration: https://go.nuxtjs.dev/config-build
  build: {
    extractCSS: true,
    transpile: [
      'lxljs',
      'lodash-es',
    ],
    extend(config, ctx) {
      if (ctx.isDev) {
        config.devtool = ctx.isClient ? 'source-map' : 'inline-source-map'
      }
    }
  }
}

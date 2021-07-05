export default {
  // Global page headers: https://go.nuxtjs.dev/config-head
  head: {
    title: 'id.kb.se',
    htmlAttrs: {
      lang: 'en'
    },
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: '' }
    ],
    link: [
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
  ],

  // Auto import components: https://go.nuxtjs.dev/config-components
  components: true,

  // Modules for dev and build (recommended): https://go.nuxtjs.dev/config-modules
  buildModules: [
  ],

  // Modules: https://go.nuxtjs.dev/config-modules
  modules: [
    '@nuxtjs/style-resources',
    '@nuxt/http',
  ],

  styleResources: {
    scss: ['~/assets/scss/*.scss']
  },

  publicRuntimeConfig: {
    apiPath: process.env.API_PATH || 'http://localhost:5000'
  },

  privateRuntimeConfig: {
  },

  // Build Configuration: https://go.nuxtjs.dev/config-build
  build: {
  }
}

const path = require('path');
process.env.VUE_APP_VERSION = require('./package.json').version;

module.exports = {
  baseUrl: '/katalogisering/',
  chainWebpack(config) {
    config.module
      .rule('vue')
      .use('vue-loader')
      .loader('vue-loader')
      .tap(options => ({
        ...options,
        compilerOptions: {
          ...options.compilerOptions,
          preserveWhitespace: true,
        },
      }));
  },
  configureWebpack: {
    resolve: {
      extensions: ['.js', '.vue', '.json'],
      alias: {
        '~': path.resolve(__dirname, 'src/'),
        '@': path.resolve('src/'),
      },
    },
  },
  pluginOptions: {
    'style-resources-loader': {
      patterns: [
        path.resolve(__dirname, 'src/styles/_*.less'),
      ],
      preProcessor: 'less',
    },
    moment: {
      locales: ['en', 'sv'],
    },
  },
};

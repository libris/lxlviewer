const path = require('path');
process.env.VUE_APP_VERSION = require('./package.json').version;

module.exports = {
  baseUrl: '/katalogisering/',
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

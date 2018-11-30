const path = require('path');

module.exports = {
  configureWebpack: {
    resolve: {
      alias: {
        '~': path.resolve(__dirname, 'src/'),
        '@': path.resolve('src/'),
      },
    },
  },
  pluginOptions: {
    'style-resources-loader': {
      patterns: [
        path.resolve(__dirname, 'src/styles/_variables.less'),
      ],
      preProcessor: 'less',
    },
  },
};

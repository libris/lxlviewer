const path = require('path');
const webpack = require('webpack');
const { gitDescribeSync } = require('git-describe');
process.env.VUE_APP_VERSION = require('./package.json').version;

process.env.VUE_APP_GIT_DESCRIBE = JSON.stringify(gitDescribeSync({
  longSemver: true,
  dirtySemver: false,
  requireAnnotated: false,
  match: '*',
}));

module.exports = {
  publicPath: '/katalogisering/',
  parallel: false,
  configureWebpack: {
    devServer: {
      //public: process.env.VUE_APP_DEV_SERVER || 'kblocalhost.kb.se',
      port: 5000
    },
    resolve: {
      extensions: ['.js', '.vue', '.json'],
      alias: {
        '~': path.resolve(__dirname, 'src/'),
        '@': path.resolve('src/'),
        modernizr$: path.resolve(__dirname, '.modernizrrc'),
      },
      fallback: {
        // SEE: https://github.com/mulesoft-labs/js-client-oauth2/issues/190
        querystring: require.resolve('querystring-es3'),
      }
    },
    // TODO make this work again
    //plugins: [
    //  new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
    //],
    // TODO make this work again
    //watchOptions: {
    //  ignored: [
    //    /node_modules([\\]+|\/)+(?!lxljs)/,
    //  ],
    //},
  },
  chainWebpack(config) {
    config.resolve.symlinks(process.env.NODE_ENV !== 'production');
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
    config.module
      .rule('modernizr')
      .test(/\.modernizrrc$/)
      .use('webpack-modernizr-loader')
      .loader('webpack-modernizr-loader');
    config.module
      .rule('jsonld')
      .test(/\.jsonld$/)
      .use('json-loader')
      .loader('json-loader');
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

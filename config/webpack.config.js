'use strict';

const { merge } = require('webpack-merge');
const webpack = require('webpack');

const common = require('./webpack.common.js');
const PATHS = require('./paths');

// Merge webpack configuration files
const config = (env, argv) =>
  merge(common, {
    entry: {
      popup: PATHS.src + '/popup.js',
      injector: PATHS.src + '/injector.js',
      background: PATHS.src + '/background.js',
    },
    devtool: argv.mode === 'production' ? false : 'source-map',
    resolve: {
      fallback: { 
        "crypto": require.resolve("crypto-js"),
        "buffer": require.resolve("buffer") 
      }
    },
    plugins: [
      new webpack.ProvidePlugin({
          Buffer: ['buffer', 'Buffer'],
      }),
      new webpack.ProvidePlugin({
          process: 'process/browser',
      }),
  ],
  });

module.exports = config;

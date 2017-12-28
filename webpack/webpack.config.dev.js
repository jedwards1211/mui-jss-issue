// @flow

const path = require('path')
const webpack = require('webpack')
const HappyPack = require('happypack')
const ProgressPlugin = require('webpack/lib/ProgressPlugin')

const babelOptions = require('./babelOptions')
const babelInclude = require('./babelInclude')

const root = path.resolve(__dirname, '..')
const srcDir = path.join(root, 'src')

const {BACKEND_PORT, PORT, BUILD_DIR} = process.env
if (!BACKEND_PORT) throw new Error('missing process.env.BACKEND_PORT')
if (!BUILD_DIR) throw new Error('missing process.env.BUILD_DIR')
if (!PORT) throw new Error('missing process.env.PORT')

const config = {
  context: root,
  devtool: process.env.WEBPACK_DEVTOOL,
  entry: [
    'babel-polyfill',
    'react-hot-loader/patch',
    './src/client/index.js',
    'webpack-hot-middleware/client',
  ],
  output: {
    // https://github.com/webpack/webpack/issues/1752
    filename: 'app.js',
    chunkFilename: '[name]_[chunkhash].js',
    path: path.join(BUILD_DIR, 'assets'),
    publicPath: '/assets/',
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoEmitOnErrorsPlugin(),
    new HappyPack({
      loaders: [
        {
          loader: 'babel-loader',
          options: babelOptions,
        },
      ],
      threads: 4,
    }),
  ],
  node: {
    process: false,
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        loader: process.env.NO_HAPPYPACK ? 'babel-loader' : 'happypack/loader',
        include: babelInclude,
      },
    ],
  },
  watch: true,
  devServer: {
    contentBase: `http://localhost:${BACKEND_PORT}`,
    publicPath: '/assets/',
    noInfo: true,
    port: PORT,
    stats: {
      colors: true,
    },
  },
}

/* istanbul ignore next */
if (!process.env.CI) config.plugins.push(new ProgressPlugin({ profile: false }))

module.exports = config



const path = require('path')
const webpack = require('webpack')
const AssetsPlugin = require('assets-webpack-plugin')
const HappyPack = require('happypack')
const ProgressPlugin = require('webpack/lib/ProgressPlugin')
const babelOptions = require('./babelOptions')
const babelInclude = require('./babelInclude')

const root = path.resolve(__dirname, '..')

const vendor = [
  'babel-polyfill',
  'react',
  'react-dom',
]

const {BUILD_DIR} = process.env
if (!BUILD_DIR) throw new Error('missing process.env.BUILD_DIR')

const config = {
  context: root,
  devtool: process.env.WEBPACK_DEVTOOL,
  entry: {
    vendor,
    app: './src/client/index.js',
  },
  output: {
    filename: '[name]_[chunkhash].js',
    chunkFilename: '[name]_[chunkhash].js',
    path: path.join(BUILD_DIR, 'assets'),
    publicPath: '/assets/',
  },
  plugins: [
    new webpack.NamedModulesPlugin(),
    new webpack.optimize.CommonsChunkPlugin({
      names: ['vendor', 'manifest'],
      minChunks: Infinity,
    }),
    new webpack.optimize.AggressiveMergingPlugin(),
    new webpack.optimize.MinChunkSizePlugin({ minChunkSize: 50000 }),
    new webpack.NoEmitOnErrorsPlugin(),
    new AssetsPlugin({ path: process.env.BUILD_DIR, filename: 'assets.json' }),
    new webpack.IgnorePlugin(/\/server\//),
    new HappyPack({
      loaders: [{
        loader: 'babel-loader',
        options: babelOptions,
      }],
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
}

/* istanbul ignore next */
if (!process.env.CI) config.plugins.push(new ProgressPlugin({ profile: false }))
if (!process.env.NO_UGLIFY) {
  config.plugins.push(new webpack.optimize.UglifyJsPlugin({
    sourceMap: true,
    compressor: { warnings: false }
  }))
}

module.exports = config

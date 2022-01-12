const path = require('path');
const nodeExternals = require('webpack-node-externals');
// eslint-disable-next-line no-unused-vars
const HtmlWebPackPlugin = require('html-webpack-plugin');
const DotEnv = require('dotenv-webpack');
const dotenv = require('dotenv');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

dotenv.config();

module.exports = {
  entry: {
    server: './app.mjs',
  },
  output: {
    path: path.join(__dirname, 'dist'),
    publicPath: '/',
    filename: '[name].js',
  },
  mode: 'production',
  target: 'node',
  node: {
    __dirname: false,
    __filename: false,
  },
  externals: [nodeExternals()],
  resolve: {
    extensions: ['.js', '.mjs'],
    alias: {
      '@App': path.resolve(__dirname, 'app'),
      '@Config': path.resolve(__dirname, 'config'),
      '@Handlers': path.resolve(__dirname, 'handlers'),
      '@Public': path.resolve(__dirname, 'public'),
      '@Routes': path.resolve(__dirname, 'routes'),
      '@Test': path.resolve(__dirname, 'test'),
    },
  },
  module: {
    rules: [{
      test: /\.(mjs|js)$/,
      exclude: /node_modules/,
      use: {
        loader: 'babel-loader',
      },
    }],
  },
  plugins: [
    new DotEnv(),
    new CleanWebpackPlugin(),
  ],
};

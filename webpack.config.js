const path = require('path');
const nodeExternals = require('webpack-node-externals');
const Webpack = require('webpack');
// eslint-disable-next-line no-unused-vars
const HtmlWebPackPlugin = require('html-webpack-plugin');
const DotEnv = require('dotenv-webpack');
const ESLintPlugin = require('eslint-webpack-plugin');

module.exports = {
  entry: {
    server: './app.mjs',
  },
  output: {
    path: path.join(__dirname, 'dist'),
    publicPath: '/',
    filename: '[name].js',
  },
  mode: 'development',
  target: 'node',
  node: {
    __dirname: false,
    __filename: false,
  },
  externals: [nodeExternals()],
  resolve: {
    extensions: ['.js', '.mjs'],
    alias: {
      '@app': path.resolve(__dirname, 'app/'),
      '@config': path.resolve(__dirname, 'config/'),
      '@handlers': path.resolve(__dirname, 'handlers/'),
      '@public': path.resolve(__dirname, 'public/'),
      '@routes': path.resolve(__dirname, 'routes/'),
      '@test': path.resolve(__dirname, 'test/'),
    },
  },
  module: {
    rules: [
      {
        test: /\.(mjs|js)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
        },
      }],
  },
  plugins: [
    new Webpack.HotModuleReplacementPlugin(),
    new DotEnv(),
    new ESLintPlugin(),
  ],
};

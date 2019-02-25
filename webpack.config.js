const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
  //mode: 'development',
  //mode: 'none',
  mode: 'production',
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].[hash].bundle.js'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      },
      {
        test: /\.sass$/,
        use: [
          { loader: 'style-loader' },
          {
            loader: 'css-loader',
          },
          { loader: 'sass-loader' }
        ]
      },
      {
        test: /\.svg$/,
        loader: 'svg-inline-loader'
      }
    ]
  },
  plugins: [new HtmlWebpackPlugin({
    title: '语音导览-银川当代美术馆',
    meta: {
      'viewport': 'initial-scale=1, maximum-scale=1, user-scalable=no, width=device-width'
    }
  })]
};
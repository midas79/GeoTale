const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const path = require('path');
const { InjectManifest } = require('workbox-webpack-plugin');

// Define base path based on environment
const isGithubPages = process.env.DEPLOY_ENV === 'github';
const BASE_PATH = isGithubPages ? '/GeoTale/' : '/';

module.exports = merge(common, {
  mode: 'production',
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader'],
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env'],
            },
          },
        ],
      },
    ],
  },
  plugins: [
    new CleanWebpackPlugin(),
    new MiniCssExtractPlugin(),

    // Use InjectManifest with revised configuration
    new InjectManifest({
      swSrc: path.resolve(__dirname, 'src/scripts/sw.js'),
      swDest: 'sw.bundle.js',
      maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
      exclude: [/offline\.html$/], // Exclude offline.html from automatic precaching
    }),
  ],
});

// webpack.common.js
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

// Define base path based on environment
const isGithubPages = process.env.DEPLOY_ENV === 'github';
const BASE_PATH = isGithubPages ? '/GeoTale/' : '/';

// Generate the manifest file if needed
try {
  require('./generate-manifest');
} catch (error) {
  console.error('Error generating manifest:', error);
}

module.exports = {
  entry: {
    app: path.resolve(__dirname, 'src/scripts/index.js'),
  },
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, 'dist'),
    publicPath: BASE_PATH,
    clean: true,
  },
  module: {
    rules: [
      {
        test: /\.(png|jpe?g|gif)$/i,
        type: 'asset/resource',
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, 'src/index.html'),
      inject: 'body',
      templateParameters: {
        BASE_PATH,
      },
    }),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, 'src/public/'),
          to: path.resolve(__dirname, 'dist/'),
          globOptions: {
            ignore: ['**/manifest.template.json'],
          },
        },
        // Explicitly copy offline.html with a specific name to avoid conflicts
        {
          from: path.resolve(__dirname, 'src/public/offline.html'),
          to: path.resolve(__dirname, 'dist/offline.html'),
        },
      ],
    }),
    // Workbox plugins will be in webpack.prod.js
  ],
};

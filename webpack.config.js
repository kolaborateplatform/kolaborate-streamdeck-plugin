const path = require('path');

module.exports = {
  entry: './src/plugin/plugin.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'plugin.js',
    library: {
      type: 'commonjs2'
    }
  },
  target: 'node',
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
      }
    ]
  },
  externals: {
    // External modules that shouldn't be bundled
    '@elgato-stream-deck/node': 'commonjs2 @elgato-stream-deck/node',
    'ws': 'commonjs2 ws'
  }
};
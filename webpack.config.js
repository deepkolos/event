// const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const path = require('path');

module.exports = {
  entry: './example/index.js',
  output: {
    filename: 'index.out.js',
    path: path.resolve(__dirname, 'example')
  },
  module: {
    rules: [
      // {
      //   test: /\.js$/,
      //   exclude: /node_modules/,
      //   loader: "eslint-loader",
      //   options: {
      //     // eslint options (if necessary)
      //   }
      // },
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['env']
          }
        }
      }
    ]
  },
  plugins: [
    // new UglifyJSPlugin()
  ],
  devServer: {
    contentBase: 'example',
    compress: true,
    port: 1107,
    host: '0.0.0.0',
    disableHostCheck: true,
    public:'0.0.0.0:1107'
  }
};
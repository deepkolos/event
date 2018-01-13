// const UglifyJSPlugin = require('uglifyjs-webpack-plugin');

module.exports = {
  entry: './example/index.js',
  output: {
    filename: './example/index.out.js'
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
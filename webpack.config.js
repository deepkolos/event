// const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const path = require('path');

function entry (list) {
  var cfg = {}

  list.forEach(function(item){
    cfg[item] = `./example/${item}.js`
  })
  return cfg
}

module.exports = {
  entry: entry([
    'index', 'base', 'finger', 'repeat'
  ]),
  output: {
    filename: '[name].out.js',
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
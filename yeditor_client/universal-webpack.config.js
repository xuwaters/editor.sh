// Work around for https://github.com/angular/angular-cli/issues/7200

const path = require('path');
const webpack = require('webpack');

const rootdir = __dirname;

module.exports = {
  entry: {
    // This is our Express server for Dynamic universal
    'universal-server': './universal-server.ts',
    // This is an example of Static prerendering (generative)
    // 'universal-prerender': './universal-prerender.ts'
  },
  target: 'node',
  resolve: {
    extensions: ['.ts', '.js']
  },
  // Make sure we include all node_modules etc
  externals: [/(node_modules|main-.*\.js)/, ],
  output: {
    // Puts the output at the root of the dist folder
    path: path.join(rootdir, 'dist'),
    filename: '[name].js'
  },
  module: {
    rules: [{
        test: /\.ts$/,
        loader: 'ts-loader'
      },
      {
        test: /\.css$/,
        loader: ['style-loader', 'css-loader']
      }
    ]
  },
  plugins: [
    new webpack.ContextReplacementPlugin(
      // fixes WARNING Critical dependency: the request of a dependency is an expression
      /(.+)?angular(\\|\/)core(.+)?/,
      path.join(rootdir, 'src'), // location of your src
      {} // a map of your routes
    ),
    new webpack.ContextReplacementPlugin(
      // fixes WARNING Critical dependency: the request of a dependency is an expression
      /(.+)?express(\\|\/)(.+)?/,
      path.join(rootdir, 'src'), {}
    )
  ]
}

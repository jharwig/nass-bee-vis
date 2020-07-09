const ReactRefreshPlugin = require('@pmmmwh/react-refresh-webpack-plugin')
const HTMLPlugin = require('html-webpack-plugin')

module.exports = (env) => {
  const dev = env !== 'production'
  const mode = dev ? 'development' : 'production'
  return {
    output: {
      filename: dev ? '[name].js' : '[name].[chunkhash].js',
      publicPath: '/',
    },
    plugins: [new HTMLPlugin({title: '💀'}), new ReactRefreshPlugin()],
    devtool: dev ? 'cheap-module-source-map' : 'source-map',
    mode,
    resolve: {
      extensions: ['.tsx', '.js', '.json'],
    },
    module: {
      rules: [
        {
          test: /\.(js|tsx)$/,
          use: {
            loader: 'babel-loader',
            options: {envName: mode},
          },
        },
      ],
    },
    performance: {hints: false},
    devServer: {
      historyApiFallback: true,
      host: '0.0.0.0',
      hot: true,
      open: true,
      stats: 'minimal',
    },
  }
}

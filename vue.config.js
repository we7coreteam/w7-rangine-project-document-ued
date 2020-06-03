
const path = require('path')
const webpack = require('webpack')
const CompressionPlugin = require("compression-webpack-plugin")
function resolve(dir) {
  return path.join(__dirname, dir);
}

module.exports = {
  publicPath: '/',
  outputDir: resolve('../document-apiserver/public'), // 构建目录
  assetsDir: '', //静态资源目录
  devServer: {
    host: '0.0.0.0',
    // proxy: 'http://api.we7888.cn/',
    proxy: 'http://wiki.we7888.cn/',
    // proxy: {
    //   '/api': {
    //     target: 'http://192.168.168.23:99/',
    //     // secure: false,
    //     changeOrigin: true,
    //     // pathRewrite: {
    //     //   '^/api': '',
    //     // },
    //   }
    // }
  },
  chainWebpack: config => {
    config.resolve.alias.set('@', resolve('src'))
    config.plugins.delete('prefetch') // 移除prefetch
  },
  productionSourceMap: false,
  runtimeCompiler: false,
  transpileDependencies: [],
  css: {
    sourceMap: false
  },
  configureWebpack: config => {
    return {
      performance: {
        hints: false
      },
      plugins: [
        new CompressionPlugin({
          test: /\.js$|\.html$|\.css/,
          threshold: 10240,
          deleteOriginalAssets: false
        }),
        new webpack.ProvidePlugin({
          $: "jquery",
          jQuery: "jquery",
          "windows.jQuery": "jquery",
        }),

        // new webpack.HotModuleReplacementPlugin() // hot: true 开启了hot模式，无需手动加载HotModuleReplacementPlugin
      ]
    }

  }
}

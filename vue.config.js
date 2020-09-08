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
    proxy: 'http://192.168.168.31:99/',
    // proxy: 'http://wiki.we7888.cn/',
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
    config.resolve.symlinks(true);
    config.resolve.alias.set('@', resolve('src'));
    config.plugins.delete('prefetch'); // 移除prefetch
  },
  productionSourceMap: false,
  runtimeCompiler: false,
  transpileDependencies: [],
  css: {
    sourceMap: false
  },
  configureWebpack: config => {
    /*
    * npm install terser-webpack-plugin --save
    * 去除生产环境console.log*/
    if(process.env.NODE_ENV === 'production'){
      config.optimization.minimizer[0].options.terserOptions.compress.drop_console = true
    }
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
      ],
    }
  },
}

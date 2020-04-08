var path = require('path')
function resolve(dir) {
  return path.join(__dirname, dir)
}
module.exports = {
  publicPath: '/',
  outputDir: resolve('../document-apiserver/public'), // 构建目录
  assetsDir: '', //静态资源目录
  devServer: {
    proxy: 'http://192.168.168.23:99/',
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
  }
}

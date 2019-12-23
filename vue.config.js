var path = require('path')
function resolve(dir) {
  return path.join(__dirname, dir)
}
module.exports = {
  publicPath: '/',
  outputDir: resolve('../document-apiserver/public'), // 构建目录
  assetsDir: '', //静态资源目录
  devServer: {
    // proxy: 'http://we7.ngrok.ibanzhuan.cn/'
    proxy: 'https://wiki.w7.cc/'
  },
  chainWebpack: config => {
    config.resolve.alias.set('@', resolve('src'))
    config.plugins.delete('prefetch') // 移除prefetch
  }
}

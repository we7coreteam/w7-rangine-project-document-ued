var path = require('path')
function resolve(dir) {
  return path.join(__dirname, dir)
}
module.exports = {
  publicPath: '/',
  outputDir: resolve('../document-apiserver/public'), // 构建目录
  assetsDir: '', //静态资源目录
  devServer: {
    // proxy: 'http://wiki.ngrok.ibanzhuan.cn'
    // proxy: 'https://wiki.w7.cc/'
    proxy: 'http://111.229.106.40:89/'
  },
  chainWebpack: config => {
    config.resolve.alias.set('@', resolve('src'))
    config.plugins.delete('prefetch') // 移除prefetch
  }
}

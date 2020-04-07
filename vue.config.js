var path = require('path')
function resolve(dir) {
  return path.join(__dirname, dir)
}
module.exports = {
  publicPath: '/',
  outputDir: resolve('../document-apiserver/public'), // 构建目录
  assetsDir: '', //静态资源目录
  devServer: {
    host: '0.0.0.0',
    sockHost: 'http://localhost:8080/',
    disableHostCheck: true,
    proxy: {
      '/': {
        target: 'http://192.168.168.31:99/',
        // secure: false,
        changeOrigin: true,
        pathRewrite: {
          '^/': '',
        },
      },
      '/admin': {
        target: 'http://192.168.168.31:99/',
        // secure: false,
        changeOrigin: true,
        pathRewrite: {
          '^/admin': '',
        },
      },
      '/client': {
        target: 'http://192.168.168.31:99/',
        // secure: false,
        changeOrigin: true,
        pathRewrite: {
          '^/client': '',
        }
      },
      js: {
        target: 'http://192.168.168.31:99/',
        // secure: false,
        changeOrigin: true,
        pathRewrite: {
          '^/js': '',
        }
      }
    }
  },
  chainWebpack: config => {
    config.resolve.alias.set('@', resolve('src'))
    config.plugins.delete('prefetch') // 移除prefetch
  }
}

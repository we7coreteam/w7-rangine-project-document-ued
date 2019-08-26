var path = require('path')
function resolve(dir) {
	return path.join(__dirname, dir)
}
module.exports = {
	publicPath: '/',
	outputDir: resolve('../document-apiserver/public'), // 构建目录
	assetsDir: '', //静态资源目录
	devServer: {
		proxy: {
			'/admin': {
				target: 'http://172.16.1.13:98/',
				// secure: false,
				changeOrigin: true,
				headers: {
					'User-Agent': "we7test-develop",
					host: 'https://wiki.w7.cc/'
				},
			},
			'/client': {
				target: 'http://172.16.1.13:98/',
				// secure: false,
				changeOrigin: true,
				headers: {
					'User-Agent': "we7test-develop",
					host: 'https://wiki.w7.cc/'
				},
		}
		}
	},
	chainWebpack: config => {
		config.resolve.alias
			.set('@', resolve('src'))
		config.plugins.delete('prefetch') // 移除prefetch
	}
}
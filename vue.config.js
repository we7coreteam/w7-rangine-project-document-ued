var path = require('path')
function resolve(dir) {
	return path.join(__dirname, dir)
}
module.exports = {
	devServer: {
		proxy: {
			'/admin': {
					target: 'https://wiki.w7.cc/',
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
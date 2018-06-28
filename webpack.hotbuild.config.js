module.exports = function (opts) {
	const path = require('path')
	const HtmlWebpackPlugin = require('html-webpack-plugin')
	const CopyWebpackPlugin = require('copy-webpack-plugin')

	var option = {
		entry: './sources/index.js',
		mode: 'production',
		devtool: 'inline-source-map',
		devServer: {
			contentBase: './build'
		},

		output: {
			filename: 'army-weather.js',
			path: path.resolve(__dirname, 'build'),
			publicPath: './'
		},

		plugins: [
			new HtmlWebpackPlugin({
				filename: 'index.html',
				template: './sources/index.html',
				favicon: './sources/favicon.ico'
			}),

			new CopyWebpackPlugin([{
				from: './resources/',
				to: './resources/',
				toType: 'dir'
			}])
		],

		module: {
			rules: [
				{
					test: /\.js$/,
					exclude: /node_modules/,
					loader: "eslint-loader",
					options: { fix: true }
				}
			]
		}
	}

	return option
}
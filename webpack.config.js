const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')

module.exports = {
	entry: './sources/index.js',
	mode: 'production',
	devtool: 'none',
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
		unsafeCache: true,
		rules: [
			/*
			{
				test: /\.js$/,
				exclude: /node_modules/,
				loader: "eslint-loader",
				options: {
					fix: false,
					parserOptions:{
						sourceType: "module",
						allowImportExportEverywhere: true
					}
				}
			}
			*/
		]
	},

	optimization: {
		runtimeChunk: 'single',

		splitChunks: {
			chunks: 'async',
			minSize: 30000,
			minChunks: 1,
			maxAsyncRequests: 5,
			maxInitialRequests: 3,
			name: true,

			cacheGroups: {
				default: {
					minChunks: 1,
					priority: -20,
					reuseExistingChunk: true,
				},

				vendors: {
					minChunks: 1,
					test: /[\\/]node_modules[\\/]/,
					priority: -10,
					reuseExistingChunk: true,
					chunks: 'all'
				},
			},
		},
	},

	node: {
		console: true,
		fs: 'empty',
		net: 'empty',
		tls: 'empty'
	}
}
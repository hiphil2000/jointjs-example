const path = require('path');
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
    resolve: {
        extensions: ['.ts', '.tsx', '.js']
    },
    entry: './src/index.ts',
	devtool: 'inline-source-map',
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'dist'),
    },
    mode: 'development',
    module: {
        rules: [
            { test: /\.ts?$/, loader: 'ts-loader' },
			{
				test: /\.css$/i,
				use: ["style-loader", "css-loader"],
			},
        ]
    },
	devServer: {
    },
	plugins: [
		new HtmlWebpackPlugin({
			template: "index.html",
		}),
	]
};

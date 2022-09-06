const path = require('path');

module.exports = {
    resolve: {
        extensions: ['.ts', '.tsx', '.js']
    },
    entry: './src/index.ts',
	devtool: 'inline-source-map',
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'dist'),
        publicPath: '/dist/'
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
        static: {
            directory: __dirname,
        },
        compress: true
    },
};

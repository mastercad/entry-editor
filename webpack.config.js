const path = require('path');
const webpack = require('webpack');
const HTMLWebpackPlugin = require('html-webpack-plugin');
const TerserPlugin = require("terser-webpack-plugin");

const libraryName = 'EntryEditor'
const outputFile = `${libraryName}.js`

module.exports = {
    entry: './src/index.js',
//    entry: {
//        EntryModel: "./src/lib/EntryModel.js",
//        EntryView: "./src/lib/EntryView.js",
//        EntryController: "./src/lib/EntryController.js"
//    },
//    loaders: [
//      {exclude: ['node_modules'], loader: 'babel', test: /\.jsx?$/},
//      {loader: 'style-loader!css-loader', test: /\.css$/},
//      {loader: 'url-loader', test: /\.gif$/},
//      {loader: 'file-loader', test: /\.(ttf|eot|svg)$/},
//    ],
    output: {
        publicPath: "./",
        library: libraryName,
//        library: ["EntryEditor", "[name]"],
        libraryTarget: 'umd',
        libraryExport: 'default',
        path: path.resolve(__dirname, 'dist'),
        filename: outputFile
//        filename: "EntryEditor.[name].js"
    },
    optimization: {
//      runtimeChunk: true,
//      minimize: true,
//      minimizer: [new TerserPlugin()],
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                loader: 'babel-loader',
				include: [
					path.resolve(__dirname, "src")
				],
                options: {
                    presets: [
                        '@babel/preset-env'
                    ]
                },
                exclude: /node_modules/,
            },
            {
                test: /\.scss$/,
                use: [
                    'style-loader',
                    'css-loader',
                    'postcss-loader',
                    'sass-loader'
                ]
            }
        ]
    },
    plugins: [
        new HTMLWebpackPlugin({
            template: path.resolve(__dirname, 'index.html')
        }),
        new webpack.HotModuleReplacementPlugin(),
    ]
};

const TerserJSPlugin            = require('terser-webpack-plugin');
const MiniCssExtractPlugin      = require("mini-css-extract-plugin");
const OptimizeCSSAssetsPlugin   = require('optimize-css-assets-webpack-plugin');
const merge                     = require('webpack-merge');
const common                    = require('./webpack.common.js');
const path                      = require('path');


module.exports = merge(common, {
    mode: 'production',
    devtool: 'source-map',
    output: {
        filename: '[name]_[hash].js',
        path: path.resolve(__dirname, 'dist'),
        publicPath: '/',
        pathinfo: false
    },
    optimization: {
        minimizer: [
            new TerserJSPlugin({terserOptions: {compress: {inline: false}}}),
            new OptimizeCSSAssetsPlugin({})
        ],
    },
    plugins: [
        new MiniCssExtractPlugin({
            filename: '[name].[hash].css',
        }),
    ]
});

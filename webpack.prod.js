const TerserJSPlugin            = require('terser-webpack-plugin');
const MiniCssExtractPlugin      = require("mini-css-extract-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const { merge }                 = require('webpack-merge');
const common                    = require('./webpack.common.js');
const path                      = require('path');


module.exports = merge(common, {
    mode: 'production',
    output: {
        filename: '[name]_[contenthash].js',
        path: path.resolve(__dirname, 'dist'),
        publicPath: '/',
        pathinfo: false
    },
    optimization: {
        minimize: true,
        minimizer: [
            new TerserJSPlugin({
                    parallel: true,
                    terserOptions: {
                        mangle: { reserved: ['Lock','SuperTokensLock','GET_TOKEN_SILENTLY_LOCK_KEY'] },
                        compress: {inline: false}
                    }
            }),
            new CssMinimizerPlugin(),
        ],
        splitChunks: {
            chunks: 'all'
        }
    },
    plugins: [
        new MiniCssExtractPlugin({
            filename: '[name].[contenthash].css',
        }),
    ]
});

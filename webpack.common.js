const HtmlWebpackPlugin         = require('html-webpack-plugin');
const { CleanWebpackPlugin }    = require('clean-webpack-plugin');
const Dotenv                    = require('dotenv-webpack');
const MiniCssExtractPlugin      = require("mini-css-extract-plugin");

module.exports = {
    entry: "./src/index.js",
    plugins: [
        new CleanWebpackPlugin(),
        new HtmlWebpackPlugin({
            title: 'Summit Admin',
            template: './src/index.ejs'
        }),
        new Dotenv({
            expand: true
        })
    ],
    node: {fs: 'empty'},
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: [
                            [
                                "@babel/preset-env",
                                { "targets": { "node": "current" } }
                            ],
                            '@babel/preset-react',
                            '@babel/preset-flow'
                        ],
                        plugins: ['@babel/plugin-proposal-object-rest-spread']
                    }
                }
            },
            {
                test: /\.css$/,
                use: [MiniCssExtractPlugin.loader, "css-loader"]
            },
            {
                test: /\.less/,
                use: [MiniCssExtractPlugin.loader, "css-loader", "less-loader"]
            },
            {
                test: /\.scss/,
                exclude: /\.module\.scss/,
                use: [MiniCssExtractPlugin.loader, "css-loader", 'sass-loader']
            },
            {
                test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
                use: "url-loader?limit=10000&minetype=application/font-woff&name=fonts/[name].[ext]"
            },
            {
                test: /\.(ttf|eot)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
                use: "file-loader?name=fonts/[name].[ext]"
            },
            {
                test: /\.jpg|\.png|\.gif$/,
                use: "file-loader?name=images/[name].[ext]"
            },
            {
                test: /\.svg/,
                use: "file-loader?name=svg/[name].[ext]!svgo-loader"
            },
            {
                test: /\.yaml$/,
                use: 'js-yaml-loader',
            }
        ]
    },
};

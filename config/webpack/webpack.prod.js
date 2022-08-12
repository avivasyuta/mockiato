const { merge } = require('webpack-merge');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');
const common = require('./webpack.common.js');

module.exports = merge(common, {
    mode: 'production',
    plugins: [
        new HtmlWebpackPlugin({
            template: path.resolve(__dirname, '../../public/devtools.html'),
            filename: 'devtools.html',
            skipAssets: ['app.js', 'contentScript.js', 'interceptor.js'],
        }),
        ...common.plugins,
        new CopyWebpackPlugin({
            patterns: [
                {
                    from: '.',
                    to: '.',
                    context: 'public',
                    globOptions: {
                        ignore: ['**/*.html'],
                    },
                },
            ],
        }),
    ],
    output: {
        path: path.join(__dirname, '../../build'),
        filename: '[name].js',
        clean: true,
    },
});

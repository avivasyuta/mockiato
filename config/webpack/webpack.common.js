const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { HtmlWebpackSkipAssetsPlugin } = require('html-webpack-skip-assets-plugin');

const srcDir = '../../src/';

module.exports = {
    entry: {
        app: path.join(__dirname, `${srcDir}index.tsx`),
        devtools: path.join(__dirname, `${srcDir}scripts/devtools.ts`),
        interceptor: path.join(__dirname, `${srcDir}scripts/interceptor.ts`),
        contentScript: path.join(__dirname, `${srcDir}scripts/contentScript.ts`),
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader'],
            },
        ],
    },
    resolve: {
        extensions: ['.wasm', '.ts', '.tsx', '.mjs', '.cjs', '.js', '.json', '.css'],
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: path.resolve(__dirname, '../../public/index.html'),
            filename: 'index.html',
            skipAssets: ['devtools.js', 'contentScript.js', 'interceptor.js'],
        }),
        new HtmlWebpackSkipAssetsPlugin(),
    ],
};

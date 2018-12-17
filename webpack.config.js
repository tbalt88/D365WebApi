let path = require("path");

module.exports = {
    //devtool: 'source-map',
    entry: {
        "D365WebApi": "./source/D365WebApi.js"
    },
    mode: "production",
    output: {
        filename: "[name].js",
        path: path.resolve(__dirname, "output"),
        library: "D365WebApi",
        libraryTarget:"var"
    },
    resolve: {
        extensions: ['.Webpack.js', '.web.js', '.ts', '.js', '.jsx', '.tsx']
    },
}
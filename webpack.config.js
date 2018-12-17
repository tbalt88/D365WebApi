module.exports = {
    //devtool: 'source-map',
    entry: "./source/D365WebApi.js",
    mode: "production",
    output: {
        filename: "D365WebApi.js",
        path: require("path").resolve(__dirname, "output"),
        library: "D365WebApi",
        libraryTarget:"var"
    },
    resolve: {
        extensions: ['.Webpack.js', '.web.js', '.ts', '.js', '.jsx', '.tsx']
    },
}
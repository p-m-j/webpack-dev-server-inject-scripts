const path = require("path");
const injectScripts = require("webpack-dev-server-inject-scripts");

module.exports = {
  mode: 'development',
  entry: {
    "out-a": "./src/entry-a.js",
    "out-b": "./src/entry-b.js",
  },
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: ["style-loader", "css-loader"]
      },
    ],
  },
  devServer: {
    index: "",
    port: 8080,
    hot: true,
    proxy: {
      "/": {
        target: "https://www.ft.com/", // Your backend application here
        changeOrigin: true // play nice with upstream https
      }
    },
    before: function (app, server, compiler) {
      app.use(injectScripts(compiler));
    }
  }
};

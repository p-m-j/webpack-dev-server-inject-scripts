// @ts-check
const injectScripts = require("webpack-dev-server-inject-scripts");

/** @type {import('webpack').Configuration} */
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
    port: 8080,
    hot: true,
    devMiddleware: {
      index: "",
    },
    proxy: {
      "/": {
        target: "http://localhost:65535", // Your backend application here
        changeOrigin: true, // play nice with upstream https
      }
    },
    setupMiddlewares: (middlewares, devServer) => {
      if (!devServer) {
        throw new Error('webpack-dev-server is not defined');
      }

      middlewares.unshift({
        name: 'webpack-dev-server-inject-scripts',
        middleware: injectScripts(devServer, {ignoredPaths: [/\/ignored/]})
      });

      return middlewares;
    },
  }
};

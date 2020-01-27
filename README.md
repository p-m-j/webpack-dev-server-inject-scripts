# webpack-dev-server-inject-scripts

Adds a script element for each javascript chunk file to body markup
when using webpack-dev-server to proxy another application.

Intended usage is to simplify webpack usage with a traditional CMS e.g Wordpress, Umbraco, Drupal
making use of http-proxy-middleware to serve the backend application and webpack-dev-server to serve the built client side assets.

## Install

```bash
npm i --save-dev webpack-dev-server-inject-scripts
```

## Usage

Add the following to dev webpack config

```js
const WebpackDevServerInjectScriptsPlugin = require("webpack-dev-server-inject-scripts");
const injectScripts = new WebpackDevServerInjectScriptsPlugin({
    ignoredPaths: [/\/umbraco/, /\/wp-admin/] // Paths to ignore
});

...

devServer: {
  index: "",
  port: 8080,
  hot: true,
  historyApiFallback: true,
  proxy: {
    "/": "http://localhost:1234" // Your backend application here
  },
  before: function(app, server, compiler) {
    injectScripts.apply(app, compiler);
  }
}

```

## In Production

Turn this off, use [HtmlWebpackPlugin](https://github.com/jantimon/html-webpack-plugin) instead

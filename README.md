# webpack-dev-server-inject-scripts

webpack-dev-server is amazing when you're working on a SPA but it can be a pain to setup
when you want to use it with a traditional backend application that serves markup
instead of json, for example, a CMS that isn't headless.

- Which files do I need to reference in my master layout / template?
- What happens if I add a new entry or rename one of the output files in webpack config?

When running a production build things are easy, you can point HtmlWebpackPlugin at your layout
files and it will happily inject the necessary script and link elements and output a file you can deploy.

This project aims to provide similar functionality in development by injecting references to the code built by webpack into the markup served by your backend application when viewing through the http-proxy-middleware.

Please note that the API is likely to change without any concern for backwards compatability
until 1.0.0

## Install

```bash
npm i --save-dev webpack-dev-server-inject-scripts
```

## Usage

Add the following to dev webpack config

```js
const injectScripts = require("webpack-dev-server-inject-scripts");

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
    app.use(injectScripts(compiler));
  }
}

```

The middleware function can take an options argument for additional configuration

```js
const options = {
  ignoredPaths: [/\/umbraco/, /\/wp-admin/]
};
app.use(injectScripts(compiler, options));
```

- run backend application
- run webpack-dev-server

View through the webpack-dev-server proxy

## In Production

Turn this off and use [HtmlWebpackPlugin](https://github.com/jantimon/html-webpack-plugin) instead

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
  port: 8080,
  hot: true,
  historyApiFallback: true,
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

    // Optional options
    const options = { 
      ignoredPaths: [/\/ignored/, /\/wp-admin/]
    };

    middlewares.unshift({
      name: 'webpack-dev-server-inject-scripts',
      middleware: injectScripts(devServer, options)
    });

    return middlewares;
  },
}

```

## Usage

- run backend application
- run webpack-dev-server

View through the webpack-dev-server proxy

## In Production

Turn this off and use [HtmlWebpackPlugin](https://github.com/jantimon/html-webpack-plugin) instead

## tl;dr

Screenshot from example project

<img src="https://user-images.githubusercontent.com/2056399/110414325-942f4c00-8087-11eb-8278-abc26b15ab91.png" width="640" alt="example" />

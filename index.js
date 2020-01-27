const cheerio = require('cheerio');
const interceptor = require('express-interceptor');

const pluginName = 'WebpackDevServerInjectScriptsPlugin';

const defaultOptions = {
  ignoredPaths: []
};

class WebpackDevServerInjectScriptsPlugin {
  constructor(options) {
    this.files = {};
    this.options = Object.assign({}, defaultOptions, options);
  }

  getMiddleware() {
    const that = this;
    return interceptor(function(request, response) {
      return {
        isInterceptable: function() {
          // Only apply to html documents
          const contentType = response.get('Content-Type');
          if (!/text\/html/.test(contentType)) {
            return false;
          }

          // Ignore if path excluded in options
          const url = request.originalUrl;
          for (const i in that.options.ignoredPaths) {
            const ignored = that.options.ignoredPaths[i];
            if (url.match(ignored)) return false;
          }

          return true;
        },
        intercept: function(body, send) {
          var doc = cheerio.load(body);

          Object.keys(that.files).forEach(file => {
            doc('body').append(`<script src="${file}" />`);
          });

          send(doc.html());
        }
      };
    });
  }

  apply(app, compiler) {
    const publicPath = compiler.options.output.publicPath.endsWith('/')
      ? compiler.options.output.publicPath
      : compiler.options.output.publicPath + '/';

    const excludeHot = /\.hot-update\.js$/;
    const onlyJs = /\.js$/;

    compiler.hooks.emit.tap(pluginName, compilation => {
      compilation.chunks.forEach(chunk => {
        chunk.files.forEach(filename => {
          if (excludeHot.test(filename)) return;
          if (!onlyJs.test(filename)) return;
          this.files[`${publicPath}${filename}`] = 1;
        });
      });
    });

    app.use(this.getMiddleware());
  }
}

module.exports = WebpackDevServerInjectScriptsPlugin;

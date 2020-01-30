const cheerio = require('cheerio');
const tamper = require('tamper');

const pluginName = 'WebpackDevServerInjectScriptsPlugin';

const defaultOptions = {
  ignoredPaths: []
};

class WebpackDevServerInjectScriptsPlugin {
  constructor(compiler, options) {
    this.files = {};
    this.options = Object.assign({}, defaultOptions, options);
    this.publicPath = compiler.options.output.publicPath.endsWith('/')
      ? compiler.options.output.publicPath
      : compiler.options.output.publicPath + '/';

    compiler.hooks.emit.tap(pluginName, this.onWebpackEmit.bind(this));
  }

  middleware() {
    return tamper(this.handle.bind(this));
  }

  onWebpackEmit(compilation) {
    const excludeHot = /\.hot-update\.js$/;
    const onlyJs = /\.js$/;
    compilation.chunks.forEach(chunk => {
      chunk.files.forEach(filename => {
        if (excludeHot.test(filename)) return;
        if (!onlyJs.test(filename)) return;
        this.files[`${this.publicPath}${filename}`] = 1;
      });
    });
  }

  handle(request, response) {
    return this.shouldTransform(request, response)
      ? this.transform.bind(this)
      : false;
  }

  shouldTransform(request, response) {
    const contentType = response.get('Content-Type');
    if (!/text\/html/.test(contentType)) {
      return false;
    }

    // Ignore if path excluded in options
    const url = request.originalUrl;
    for (const i in this.options.ignoredPaths) {
      const ignored = this.options.ignoredPaths[i];
      if (url.match(ignored)) return false;
    }

    return true;
  }

  transform(body) {
    var doc = cheerio.load(body);

    Object.keys(this.files).forEach(file => {
      doc('body').append(`<script src="${file}"></script>`);
    });

    return doc.html();
  }
}

module.exports = WebpackDevServerInjectScriptsPlugin;

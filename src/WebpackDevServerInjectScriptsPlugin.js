const pluginName = 'WebpackDevServerInjectScriptsPlugin';

const defaultOptions = {
  ignoredPaths: []
};

// TODO: Add winston and some logging to aid debugging.

class WebpackDevServerInjectScriptsPlugin {
  constructor(compiler, options) {
    this.files = {};
    this.options = Object.assign({}, defaultOptions, options);
    this.publicPath = compiler.options.output.publicPath.endsWith('/')
      ? compiler.options.output.publicPath
      : compiler.options.output.publicPath + '/';

    if (this.publicPath.startsWith('auto/')) {
      console.warn(`(${pluginName}) - auto public path may not be handled correctly`)
      // TODO: HtmlWebpackPlugin handle this, work it out
      this.publicPath = this.publicPath.replace('auto/', '/');
    }

    compiler.hooks.emit.tap(pluginName, this.onWebpackEmit.bind(this));
  }

  onWebpackEmit(compilation) {
    // TODO: HtmlWebpackPlugin file list better
    // run compiler.options.entry through some function to establish output filenames.

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

  shouldTransform(request, response) {
    if (response.statusCode != 200) {
      return false;
    }

    if (!/text\/html/.test(response.get('Content-Type'))) {
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
    const scripts = Object.keys(this.files)
      .map(x => `<script src="${x}"></script>`)
      .join('');

    return body.replace('</body>', `${scripts}</body>`)
  }
}

module.exports = WebpackDevServerInjectScriptsPlugin;

const defaultOptions = {
  ignoredPaths: []
};

class WebpackDevServerInjectScriptsPlugin {
  constructor(devServer, options) {
    this.options = Object.assign({}, defaultOptions, options);

    const entryNames = Object.keys(devServer.compiler.options.entry);
    const output = devServer.compiler.options.output;
    const filename = devServer.compiler.options.output.filename;
    const publicPath = output.publicPath == 'auto' ?  '/' : output.publicPath;

    this.scripts = entryNames
      .map(x => `${publicPath}${filename.replace(/\[name\]/g, x)}`)
      .filter(x => x.endsWith('.js'))
      .map(x => `<script src="${x}"></script>`)
      .join('')
  }

  shouldTransform(request, response) {
    if (!/text\/html/.test(response.get('Content-Type'))) {
      return false;
    }

    // Ignore if path excluded in options
    const url = request.originalUrl;
    for (const i in this.options.ignoredPaths) {
      const ignored = this.options.ignoredPaths[i];
      if (url.match(ignored)) {
        return false;
      }
    }

    return true;
  }

  transform(body) {
    return body.replace('</body>', `${this.scripts}</body>`)
  }
}

module.exports = WebpackDevServerInjectScriptsPlugin;

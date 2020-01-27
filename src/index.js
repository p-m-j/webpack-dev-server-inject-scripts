const tamper = require('tamper');
const InjectScripts = require('./WebpackDevServerInjectScriptsPlugin');

// Prevent gzipped responses
function preventCompression(req, res, next) {
  req.headers['accept-encoding'] = 'identity';
  next();
}

module.exports = (compiler, options) => {
  const plugin = new InjectScripts(compiler, options);

  const injectScriptsMiddleware = tamper((req, res) => {
    if (!plugin.shouldTransform(req, res)) {
      return false;
    }

    return plugin.transform.bind(plugin)
  });

  return [preventCompression, injectScriptsMiddleware]
};

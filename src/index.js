const modify = require('modify-response-middleware');
const InjectScripts = require('./WebpackDevServerInjectScriptsPlugin');

// HACK: could try do something with proxy.onProxyRes instead
function omitResponseContentLength(req, res, next) {
  const _setHeader = res.setHeader;
  res.setHeader = (name, value) => {
    if(!/content\-length/i.test(name))
    _setHeader.call(res, name, value)
  }
  next();
}

module.exports = (devServer, options) => {
  const plugin = new InjectScripts(devServer, options);

  const transformMiddleware = modify((content, req, res) => {
    if(!plugin.shouldTransform(req, res)){
      return content
    }

    return plugin.transform(content.toString());
  });

  return [omitResponseContentLength, transformMiddleware];
};

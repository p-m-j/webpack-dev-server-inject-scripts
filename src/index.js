const tamper = require('tamper');
const InjectScripts = require('./WebpackDevServerInjectScriptsPlugin');

module.exports = (compiler, options) => {
  const plugin = new InjectScripts(compiler, options);

  return tamper((request, response) => {
    return plugin.shouldTransform(request, response)
      ? plugin.transform.bind(plugin)
      : false;
  });
};

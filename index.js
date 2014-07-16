var URL = require('url');

module.exports = function (options) {
  var parent = this;

  var opts = typeof options === 'function' ? {custom: options} : options;

  return function (req, res, next) {
    var url = URL.parse(req.originalUrl || req.url || '', true);

    var skip = false;

    if (opts.custom) {
      skip = skip || opts.custom(req);
    }

    var paths = !opts.path || Array.isArray(opts.path) ?
                opts.path : [opts.path];

    if (paths) {
      skip = skip || paths.some(function (p) {
        return (typeof p === 'string' && p === url.pathname) ||
               (p instanceof RegExp && !!p.exec(url.pathname));
      });
    }

    var exts = !opts.ext || Array.isArray(opts.ext) ?
               opts.ext : [opts.ext];

    if (exts) {
      skip = skip || exts.some(function (ext) {
        return url.pathname.substr(ext.length * -1) === ext;
      });
    }

    var methods = !opts.method || Array.isArray(opts.method) ?
                  opts.method : [opts.method];

    if (methods) {
      skip = skip || !!~methods.indexOf(req.method);
    }

    if (skip) {
      return next();
    }

    parent(req, res, next);
  };
};
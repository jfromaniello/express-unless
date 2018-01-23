var URL = require('url');

module.exports = function (options) {
  var parent = this;

  var opts = typeof options === 'function' ? {custom: options} : options;
  opts.useOriginalUrl = (typeof opts.useOriginalUrl === 'undefined') ? true : opts.useOriginalUrl;

  return function (req, res, next) {
    var url = URL.parse((opts.useOriginalUrl ? req.originalUrl : req.url) || req.url || '', true);

    var skip = false;

    if (opts.custom) {
      skip = skip || opts.custom(req);
    }

    var paths = oneOrMany(opts.path);

    if (paths) {
      skip = skip || paths.some(function (p) {
        var methods = p.methods || oneOrMany(p.method);
        return isUrlMatch(p, url.pathname) && isMethodMatch(methods, req.method);
      });
    }

    var exts = (!opts.ext || Array.isArray(opts.ext)) ?
               opts.ext : [opts.ext];

    if (exts) {
      skip = skip || exts.some(function (ext) {
        return url.pathname.substr(ext.length * -1) === ext;
      });
    }

    var methods = oneOrMany(opts.method);

    if (methods) {
      skip = skip || !!~methods.indexOf(req.method);
    }

    if (skip) {
      return next();
    }

    parent(req, res, next);
  };
};

function oneOrMany(elementOrArray) {
  return !elementOrArray || Array.isArray(elementOrArray) ?
    elementOrArray : [elementOrArray];
}

function isUrlMatch(p, url) {
  var ret = (typeof p === 'string' && p === url) || (p instanceof RegExp && !!p.exec(url));
  if (p instanceof RegExp) {
    p.lastIndex = 0;
  }

  if (p && p.url) {
    ret = isUrlMatch(p.url, url)
  }
  return ret;
}

function isMethodMatch(methods, m) {
  if (!methods) {
    return true;
  }

  methods = oneOrMany(methods);

  return !!~methods.indexOf(m);
}

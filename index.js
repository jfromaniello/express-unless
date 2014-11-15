var URL = require('url');

var middleware = function (options) {
  var parent = this;

  var opts = typeof options === 'function' ? {custom: options} : options;

  var unless = function (req, res, next) {
    var url = URL.parse(req.originalUrl || req.url || '', true);

    var skip = false;

    if (opts.custom) {
      skip = skip || opts.custom(req);
    }

    var paths = !opts.path || Array.isArray(opts.path) ?
                opts.path : [opts.path];

    if (paths) {
      skip = skip || paths.some(function (path) {
    	if(path instanceof Object && !(path instanceof RegExp)){
    		var p = path.p;
    		var m = path.m;
    	}else{
        	var p = path;
    	}
        return (
          (typeof p === 'string' && p === url.pathname)
          || (p instanceof RegExp && !!p.exec(url.pathname)))
        && (!m
          || (typeof m === 'string' && m === req.method)
          || (Array.isArray(m) && !!~m.indexOf(req.method))
          );
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
  
  unless.unless = middleware; // fluid interface, chainable
  return unless;
};

module.exports = middleware;

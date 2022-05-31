import * as express from 'express';
import URL = require('url');

type Path = string | RegExp | { url: string, method: string } | { url: string, methods: string[] };

type Params = {
  method?: string | string[],
  path?: Path | Path[],
  ext?: string | string[],
  useOriginalUrl?: boolean
} | ((req: express.Request) => boolean);

export function unless(options: Params) {
  // eslint-disable-next-line @typescript-eslint/no-this-alias
  const middleware = this;

  const opts = { ...options, ...(typeof options === 'function' ? { custom: options } : {}) };
  opts.useOriginalUrl = (typeof opts.useOriginalUrl === 'undefined') ? true : opts.useOriginalUrl;

  const result = async function (req: express.Request, res: express.Response, next: express.NextFunction) {
    const url = URL.parse((opts.useOriginalUrl ? req.originalUrl : req.url) || req.url || '', true);

    let skip = false;

    if (opts.custom) {
      skip = skip || (await opts.custom(req));
    }

    const paths = oneOrMany(opts.path);

    if (paths) {
      skip = skip || paths.some(function (p) {
        const methods = p.methods || oneOrMany(p.method);
        return isUrlMatch(p, url.pathname) && isMethodMatch(methods, req.method);
      });
    }

    const exts = oneOrMany(opts.ext);

    if (exts) {
      skip = skip || exts.some(function (ext) {
        return url.pathname.substr(ext.length * -1) === ext;
      });
    }

    const methods = oneOrMany(opts.method);

    if (methods) {
      skip = skip || methods.indexOf(req.method) > -1;
    }

    if (skip) {
      return next();
    }

    middleware(req, res, next);
  };

  result.unless = unless;

  return result;
}

function oneOrMany(elementOrArray) {
  return !elementOrArray || Array.isArray(elementOrArray) ?
    elementOrArray : [elementOrArray];
}

function isUrlMatch(p, url) {
  let ret = (typeof p === 'string' && p === url) || (p instanceof RegExp && !!p.exec(url));
  if (p instanceof RegExp) {
    p.lastIndex = 0;
  }

  if (p && p.url) {
    ret = isUrlMatch(p.url, url);
  }
  return ret;
}

function isMethodMatch(methods, m) {
  if (!methods) {
    return true;
  }

  methods = oneOrMany(methods);

  return methods.indexOf(m) > -1;
}
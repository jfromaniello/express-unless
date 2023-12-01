import * as express from 'express';
import * as URL from 'url';


export type Path = string | RegExp | { url: string | RegExp, method?: string, methods?: string | string[] };

export type RequestChecker = (req: express.Request) => boolean;

export type Params = {
  method?: string | string[],
  path?: Path | Path[],
  ext?: string | string[],
  useOriginalUrl?: boolean,
  custom?: RequestChecker
} | RequestChecker;

export function unless(options: Params) {
  // eslint-disable-next-line @typescript-eslint/no-this-alias
  const middleware = this;
  const opts: Params = typeof options === 'function' ?
    { custom: options } :
    options;

  opts.useOriginalUrl = (typeof opts.useOriginalUrl === 'undefined') ? true : opts.useOriginalUrl;

  const result = async function (req: express.Request, res: express.Response, next: express.NextFunction) {
    const url = URL.parse((opts.useOriginalUrl ? req.originalUrl : req.url) || req.url || '', true);

    let skip = false;

    if (opts.custom) {
      skip = skip || (await opts.custom(req));
    }

    const paths = toArray(opts.path);

    if (paths) {
      skip = skip || paths.some(function (p) {
        if (typeof p === 'string' || p instanceof RegExp) {
          return isUrlMatch(p, url.pathname);
        } else {
          return isUrlMatch(p, url.pathname) && isMethodMatch(p.method || p.methods, req.method);
        }
      });
    }


    if (typeof opts.ext !== 'undefined') {
      const exts = toArray(opts.ext);
      skip = skip || exts.some(function (ext) {
        return url.pathname.slice(ext.length * -1) === ext;
      });
    }


    if (typeof opts.method !== 'undefined') {
      const methods = toArray(opts.method);
      skip = skip || methods.indexOf(req.method) > -1;
    }

    if (skip) {
      return next();
    }

    try {
      return middleware(req, res, next);
    } catch (err) {
      return next(err);
    }
  };

  result.unless = unless;

  return result;
}

function toArray<T>(elementOrArray: T | T[]): T[] {
  return Array.isArray(elementOrArray) ? elementOrArray : [elementOrArray];
}

function isUrlMatch(p: string | RegExp | { url: string | RegExp }, url: string) {
  if (typeof p === 'string') {
    return p === url;
  }

  if (p instanceof RegExp) {
    return url.match(p) !== null;
  }

  if (typeof p === 'object' && p.url) {
    return isUrlMatch(p.url, url);
  }

  return false;
}

function isMethodMatch(methods: undefined | string | string[], m: string): boolean {
  if (typeof methods === 'undefined') {
    return true;
  }
  return toArray(methods).includes(m);
}

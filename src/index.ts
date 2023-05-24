import express from 'express';
import * as URL from 'url';

export type Path = string | RegExp | { url: string | RegExp, method?: string, methods?: string | string[] };
export type RequestChecker = (req: express.Request) => boolean;

export interface UnlessRequestHandler extends express.RequestHandler {
  unless?: (unlessOptions: Params | RequestChecker) => UnlessRequestHandler;
}

export interface Params {
  method?: string | string[];
  path?: Path | Path[];
  ext?: string | string[];
  useOriginalUrl?: boolean;
  custom?: RequestChecker;
}

export function unless(unlessOptions: Params | RequestChecker): UnlessRequestHandler {
  // eslint-disable-next-line @typescript-eslint/no-this-alias
  const middleware: express.RequestHandler = this;
  const option: Params = typeof unlessOptions === 'function' ? { custom: unlessOptions } : unlessOptions;
  option.useOriginalUrl = (typeof option.useOriginalUrl === 'undefined') ? true : option.useOriginalUrl;

  const result: UnlessRequestHandler = applyMiddlewareOrSkip;
  result.unless = unless;
  return result;

  async function applyMiddlewareOrSkip(
    req: express.Request, res: express.Response, next: express.NextFunction
  ): Promise<void> {
    let skip = option.custom && option.custom(req);
    const url = URL.parse((option.useOriginalUrl ? req.originalUrl : req.url) || req.url || '', true);
    const paths = toArray(option?.path);

    if (paths) {
      skip = skip || paths.some((path) => typeof path === 'string' || path instanceof RegExp ?
        isUrlMatch(path, url.pathname)
        : isUrlMatch(path, url.pathname) && isMethodMatch(path.method || path.methods, req.method));
    }

    if (typeof option.ext !== 'undefined') {
      skip = skip || toArray(option.ext).some((ext) => url.pathname.slice(ext.length * -1) === ext);
    }

    if (typeof option.method !== 'undefined') {
      skip = skip || toArray(option.method).indexOf(req.method) > -1;
    }

    return skip ? next() : middleware(req, res, next)
  }
}

function toArray<T>(elementOrArray: T | T[]): T[] {
  return Array.isArray(elementOrArray) ? elementOrArray : [elementOrArray];
}

function isUrlMatch(path: string | RegExp | { url: string | RegExp }, url: string): boolean {
  if (typeof path === 'string') {
    return path === url;
  }

  if (path instanceof RegExp) {
    return url.match(path) !== null;
  }

  if (typeof path === 'object' && path.url) {
    return isUrlMatch(path.url, url);
  }

  return false;
}

function isMethodMatch(methods: undefined | string | string[], m: string): boolean {
  if (typeof methods === 'undefined') {
    return true;
  }
  return toArray(methods).includes(m);
}

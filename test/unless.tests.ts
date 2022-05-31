/* eslint-disable @typescript-eslint/no-explicit-any */
import { unless } from '../src/index';
import { assert } from 'chai';
// eslint-disable-next-line @typescript-eslint/no-empty-function
const noop = function () { };

function testMiddleware(req, res, next) {
  req.called = true;
  next();
}

testMiddleware.unless = unless;

describe('express-unless', function () {

  describe('with PATH and method exception', function () {
    const mid = testMiddleware.unless({
      path: [
        {
          url: '/test',
          methods: ['POST', 'GET']
        },
        {
          url: '/bar',
          method: 'PUT'
        },
        '/foo'
      ]
    });

    it('should not call the middleware when path and method match', function () {
      let req: any = {
        originalUrl: '/test?das=123',
        method: 'POST'
      };

      mid(req, {} as any, noop);
      assert.notOk(req.called);


      req = {
        originalUrl: '/test?test=123',
        method: 'GET'
      };

      mid(req, {} as any, noop);
      assert.notOk(req.called);

      req = {
        originalUrl: '/bar?test=123',
        method: 'PUT'
      };

      mid(req, {} as any, noop);
      assert.notOk(req.called);

      req = {
        originalUrl: '/foo',
        method: 'PUT'
      };

      mid(req, {} as any, noop);
      assert.notOk(req.called);
    });

    it('should call the middleware when path or method mismatch', function () {
      let req: any = {
        originalUrl: '/test?test=123',
        method: 'PUT'
      };

      mid(req, {} as any, noop);
      assert.ok(req.called);

      req = {
        originalUrl: '/bar?test=123',
        method: 'GET'
      };

      mid(req, {} as any, noop);
      assert.ok(req.called);

      req = {
        originalUrl: '/unless?test=123',
        method: 'PUT'
      };

      mid(req, {} as any, noop);
      assert.ok(req.called);
    });
  });

  describe('with PATH exception', function () {
    const mid = testMiddleware.unless({
      path: ['/test', '/fobo']
    });

    it('should not call the middleware when one of the path match', function () {
      let req: any = {
        originalUrl: '/test?das=123'
      };

      mid(req, {} as any, noop);

      assert.notOk(req.called);

      req = {
        originalUrl: '/fobo?test=123'
      };

      mid(req, {} as any, noop);

      assert.notOk(req.called);
    });

    it('should call the middleware when the path doesnt match', function () {
      const req: any = {
        originalUrl: '/foobar/test=123'
      };

      mid(req, {} as any, noop);

      assert.ok(req.called);
    });
  });

  describe('with PATH (regex) exception', function () {
    const mid = testMiddleware.unless({
      path: ['/test', /ag$/ig]
    });

    it('should not call the middleware when the regex match', function () {
      const req: any = {
        originalUrl: '/foboag?test=123'
      };

      const req2: any = {
        originalUrl: '/foboag?test=456'
      };

      mid(req, {} as any, noop);
      mid(req2, {} as any, noop);

      assert.notOk(req.called);
      assert.notOk(req2.called);
    });

  });

  describe('with PATH (useOriginalUrl) exception', function () {
    const mid = testMiddleware.unless({
      path: ['/test', '/fobo'],
      useOriginalUrl: false
    });

    it('should not call the middleware when one of the path match ' +
      'req.url instead of req.originalUrl', function () {
        let req: any = {
          originalUrl: '/orig/test?das=123',
          url: '/test?das=123'
        };

        mid(req, {} as any, noop);

        assert.notOk(req.called);

        req = {
          originalUrl: '/orig/fobo?test=123',
          url: '/fobo?test=123'
        };

        mid(req, {} as any, noop);

        assert.notOk(req.called);
      });

    it('should call the middleware when the path doesnt match ' +
      'req.url even if path matches req.originalUrl', function () {
        const req: any = {
          originalUrl: '/test/test=123',
          url: '/foobar/test=123'
        };

        mid(req, {} as any, noop);

        assert.ok(req.called);
      });
  });

  describe('with EXT exception', function () {
    const mid = testMiddleware.unless({
      ext: ['jpg', 'html', 'txt']
    });

    it('should not call the middleware when the ext match', function () {
      const req: any = {
        originalUrl: '/foo.html?das=123'
      };

      mid(req, {} as any, noop);

      assert.notOk(req.called);
    });

    it('should call the middleware when the ext doesnt match', function () {
      const req: any = {
        originalUrl: '/foobar/test=123'
      };

      mid(req, {} as any, noop);

      assert.ok(req.called);
    });
  });

  describe('with METHOD exception', function () {
    const mid = testMiddleware.unless({
      method: ['OPTIONS', 'DELETE']
    });

    it('should not call the middleware when the method match', function () {
      const req: any = {
        originalUrl: '/foo.html?das=123',
        method: 'OPTIONS'
      };

      mid(req, {} as any, noop);

      assert.notOk(req.called);
    });

    it('should call the middleware when the method doesnt match', function () {
      const req: any = {
        originalUrl: '/foobar/test=123',
        method: 'PUT'
      };

      mid(req, {} as any, noop);

      assert.ok(req.called);
    });
  });

  describe('with custom exception', function () {
    const mid = testMiddleware.unless(function (req) {
      return (req as any).baba;
    });

    it('should not call the middleware when the custom rule match', function () {
      const req: any = {
        baba: true
      };

      mid(req, {} as any, noop);

      assert.notOk(req.called);
    });

    it('should call the middleware when the custom rule doesnt match', function (done) {
      const req: any = {
        baba: false
      };

      mid(req, {} as any, () => {
        assert.ok(req.called);
        done();
      });
    });
  });

  describe('with async custom exception', function () {
    const mid = testMiddleware.unless(function (req) {
      return (req as any).baba;
    });

    it('should not call the middleware when the async custom rule match', function (done) {
      const req: any = {
        baba: true
      };

      mid(req, {} as any, () => {
        assert.notOk(req.called);
        done();
      });
    });

    it('should call the middleware when the async custom rule doesnt match', function (done) {
      const req: any = {
        baba: false
      };

      mid(req, {} as any, () => {
        assert.ok(req.called);
        done();
      });


    });
  });

  describe('without originalUrl', function () {
    const mid = testMiddleware.unless({
      path: ['/test']
    });

    it('should not call the middleware when one of the path match', function () {
      const req: any = {
        url: '/test?das=123'
      };

      mid(req, {} as any, noop);

      assert.notOk(req.called);
    });

    it('should call the middleware when the path doesnt match', function () {
      const req: any = {
        url: '/foobar/test=123'
      };

      mid(req, {} as any, noop);

      assert.ok(req.called);
    });
  });

  describe('chaining', function () {
    const mid = testMiddleware
      .unless({ path: '/test' })
      .unless({ method: 'GET' });

    it('should not call the middleware when first unless match', function () {
      const req: any = {
        url: '/test'
      };

      mid(req, {} as any, noop);

      assert.notOk(req.called);
    });

    it('should not call the middleware when second unless match', function () {
      const req: any = {
        url: '/safsa',
        method: 'GET'
      };

      mid(req, {} as any, noop);

      assert.notOk(req.called);
    });

    it('should call the middleware when none of the conditions are met', function () {
      const req: any = {
        url: '/foobar/test=123'
      };

      mid(req, {} as any, noop);

      assert.ok(req.called);
    });
  });

});

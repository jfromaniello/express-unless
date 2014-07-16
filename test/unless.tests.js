var unless = require('../index');
var assert = require('chai').assert;
var noop = function(){};

function testMiddleware (req, res, next) {
  req.called = true;
}

testMiddleware.unless = unless;

describe('express-unless', function () {

  describe('with PATH exception', function () {
    var mid = testMiddleware.unless({
      path: ['/test', '/fobo']
    });

    it('should not call the middleware when one of the path match', function () {
      var req = {
        originalUrl: '/test?das=123'
      };

      mid(req, {}, noop);

      assert.notOk(req.called);

      req = {
        originalUrl: '/fobo?test=123'
      };

      mid(req, {}, noop);

      assert.notOk(req.called);
    });

    it('should call the middleware when the path doesnt match', function () {
      var req = {
        originalUrl: '/foobar/test=123'
      };

      mid(req, {}, noop);

      assert.ok(req.called);
    });
  });

  describe('with PATH (regex) exception', function () {
    var mid = testMiddleware.unless({
      path: ['/test', '/fobo', /ag$/ig]
    });

    it('should not call the middleware when the regex match', function () {
      req = {
        originalUrl: '/foboag?test=123'
      };

      mid(req, {}, noop);

      assert.notOk(req.called);
    });

  });

  describe('with EXT exception', function () {
    var mid = testMiddleware.unless({
      ext: ['jpg', 'html', 'txt']
    });

    it('should not call the middleware when the ext match', function () {
      var req = {
        originalUrl: '/foo.html?das=123'
      };

      mid(req, {}, noop);

      assert.notOk(req.called);
    });

    it('should call the middleware when the ext doesnt match', function () {
      var req = {
        originalUrl: '/foobar/test=123'
      };

      mid(req, {}, noop);

      assert.ok(req.called);
    });
  });

  describe('with METHOD exception', function () {
    var mid = testMiddleware.unless({
      method: ['OPTIONS', 'DELETE']
    });

    it('should not call the middleware when the method match', function () {
      var req = {
        originalUrl: '/foo.html?das=123',
        method: 'OPTIONS'
      };

      mid(req, {}, noop);

      assert.notOk(req.called);
    });

    it('should call the middleware when the method doesnt match', function () {
      var req = {
        originalUrl: '/foobar/test=123',
        method: 'PUT'
      };

      mid(req, {}, noop);

      assert.ok(req.called);
    });
  });

  describe('with custom exception', function () {
    var mid = testMiddleware.unless(function (req) {
      return req.baba;
    });

    it('should not call the middleware when the custom rule match', function () {
      var req = {
        baba: true
      };

      mid(req, {}, noop);

      assert.notOk(req.called);
    });

    it('should call the middleware when the custom rule doesnt match', function () {
      var req = {
        baba: false
      };

      mid(req, {}, noop);

      assert.ok(req.called);
    });
  });

});
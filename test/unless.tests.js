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

  describe('with single PATH (obj)', function () {
	    var mid = testMiddleware.unless({
	      path: {p: '/nada'}
	    });
	    it('should not call the middleware when one of the path match', function () {
	      var req = {
	        originalUrl: '/nada'
	      };
	      mid(req, {}, noop);
	      assert.notOk(req.called);

	      var req = {
	        originalUrl: '/nada?das=123',
	        method: 'OPTIONS'
	      };
	      mid(req, {}, noop);
	      assert.notOk(req.called);
	    });

	    it('should call the middleware when the path doesnt match', function () {
	      var req = {
	  	        originalUrl: '/foobar'
	  	      };
	  	      mid(req, {}, noop);
	  	      assert.ok(req.called);

	  	      var req = {
	        originalUrl: '/foobar/test=123'
	      };
	      mid(req, {}, noop);
	      assert.ok(req.called);
	    });
	  });

  describe('with single PATH (obj with method)', function () {
	    var mid = testMiddleware.unless({
	      path: {p: '/nada', m: ['OPTIONS', 'GET']}
	    });
	    it('should not call the middleware when one of the path match', function () {
	      var req = {
	        originalUrl: '/nada',
            method: 'OPTIONS'
	      };
	      mid(req, {}, noop);
	      assert.notOk(req.called);

	      var req = {
	        originalUrl: '/nada?das=123',
            method: 'GET'
	      };
	      mid(req, {}, noop);
	      assert.notOk(req.called);
	    });

	    it('should call the middleware when the path doesnt match', function () {
	      var req = {
  	        originalUrl: '/foobar'
  	      };
  	      mid(req, {}, noop);
  	      assert.ok(req.called);

  	      var req = {
	        originalUrl: '/nada/test=123',
            method: 'PUT'
	      };
	      mid(req, {}, noop);
	      assert.ok(req.called);
	    });
	  });

  describe('with array of PATHs (obj with method)', function () {
	    var mid = testMiddleware.unless({
	      path: [
 	        '/milica',
	        {p: '/nada', m: 'OPTIONS'},
	        {p: '/mile', m: ['DELETE', 'PUT']}
	      ]
	    });
	    it('should not call the middleware when one of the path match', function () {
	      var req = {
	        originalUrl: '/milica',
            method: 'OPTIONS'
	      };
	      mid(req, {}, noop);
	      assert.notOk(req.called);

	      var req = {
	        originalUrl: '/nada?das=123',
            method: 'OPTIONS'
	      };
	      mid(req, {}, noop);
	      assert.notOk(req.called);

	      var req = {
  	        originalUrl: '/mile?das=123',
  	        method: 'DELETE'
	      };
	      mid(req, {}, noop);
	      assert.notOk(req.called);

	      var req = {
	        originalUrl: '/mile?das=123',
	        method: 'PUT'
  	      };
  	      mid(req, {}, noop);
  	      assert.notOk(req.called);
	    });

	    it('should call the middleware when the path doesnt match', function () {
	      var req = {
	        originalUrl: '/foobar'
	      };
	      mid(req, {}, noop);
	      assert.ok(req.called);

	      var req = {
	        originalUrl: '/nada/test=123',
            method: 'PUT'
	      };
	      mid(req, {}, noop);
	      assert.ok(req.called);

	      var req = {
  	        originalUrl: '/mile/test=123',
  	        method: 'GET'
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

  describe('with PATH (obj) (regex) exception', function () {
	    var mid = testMiddleware.unless({
	      path: ['/test', '/fobo', {p: /da+/}, {p: /ag$/ig, m: 'GET'}]
	    });

	    it('should not call the middleware when the regex match', function () {

	      req = {
  	        originalUrl: '/nadaa?test=123',
  	        method: 'GET'
  	      };
  	      mid(req, {}, noop);
  	      assert.notOk(req.called);

  	      req = {
	        originalUrl: '/foboag?test=123',
            method: 'GET'
	      };
	      mid(req, {}, noop);
	      assert.notOk(req.called);
	    });

	    it('should call the middleware when the path doesnt match', function () {
	      req = {
  	        originalUrl: '/foboaga?test=123',
  	        method: 'GET'
  	      };
  	      mid(req, {}, noop);
  	      assert.ok(req.called);

  	      req = {
	        originalUrl: '/foboag?test=123',
          method: 'PUT'
	      };
	      mid(req, {}, noop);
	      assert.ok(req.called);
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

  describe('with CHAINED UNLESS', function () {
	    var mid = testMiddleware
	    	.unless({path: ['/test', '/fobo']})
	    	.unless({path: {p: '/nada', m: ['PUT', 'GET']}})
	    	.unless({method: ['OPTIONS']});

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

	      req = {
	        originalUrl: '/nada?test=123',
	        method: 'GET'
	      };
	      mid(req, {}, noop);
	      assert.notOk(req.called);

	      req = {
	        originalUrl: '/anything',
	        method: 'OPTIONS'
	      };
	      mid(req, {}, noop);
	      assert.notOk(req.called);
	    });

	    it('should call the middleware when the path doesnt match', function () {
	      var req = {
	        originalUrl: '/testing'
	      };
	      mid(req, {}, noop);
	      assert.ok(req.called);

	      var req = {
  	        originalUrl: '/nada',
	        method: 'POST'
  	      };
  	      mid(req, {}, noop);
  	      assert.ok(req.called);

	      var req = {
  	        originalUrl: '/wrong',
	        method: 'POST'
  	      };
  	      mid(req, {}, noop);
  	      assert.ok(req.called);
	    });
	  });

});
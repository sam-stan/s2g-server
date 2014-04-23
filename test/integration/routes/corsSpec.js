'use strict';

var server = require('../../lib/server.js')
  , url = server.url
  , request = require('supertest')
  , chai = require('chai')
  , expect = chai.expect
  ;

describe( 'CORS', function() {

  before( function (done) {
    server.ready(done);
  });

  describe( 'Access-Control-Allow-Origin', function () {
    it('should be set to the origin header of the request', function (done) {
      request(url)
        .get('/version')
        .set('Origin', '*')
        .expect('Access-Control-Allow-Origin', '*')
        .expect(200, done);
    });
    it('should not include it when no origin is specified', function (done) {
      request(url)
        .get('/version')
        .expect(200)
        .end(function(err,res) {
          if (err) return done(err);
          expect(res.headers['access-control-allow-origin']).to.be.undefined;
          return done();
        });
    });
  });
  describe( 'Pre-flight requests', function () {
    it('should return all expected headers', function (done) { 
      request(url)
        .options('/token')
        .set('Origin', '*')
        .set('Access-Control-Request-Method', 'POST')
        .expect('Access-Control-Allow-Origin', '*')
        .expect('Access-Control-Allow-Methods', 'POST')
        .expect('Access-Control-Max-Age', '3600')
        .expect('Access-Control-Allow-Headers', 'accept, accept-version, content-type, request-id, origin, x-api-version, x-request-id, authorization')
        .expect(200, done);
    });
  });
});

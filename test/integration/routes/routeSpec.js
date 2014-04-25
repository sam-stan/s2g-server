'use strict';

// 
// All integration and acceptance can and should run with an 
// in-process service exposing a localhost:port endpoint or an 
// external endpoint supplied as configuration.

// When no configuration is supplied for the test url, localhost is 
// selected and the default or supplied port setting is used. The test 
// suite will attempt to start an in-process server and run the suite 
// against it. Use such a configuration when you are developing the 
// application and want to do continuous testing and integration.

// When a test url is configured, the test suite will run against 
// that endpoint.  Use this configuration to do deployment validation
// and acceptance testing.

var chai = require('chai')
  , should = chai.should()
  , expect = chai.expect
  , request = require('supertest') 
  , conf = require('../../../app/config')
  , logger = require('../../../app/logging').logger
  , api_assertions = require('../../lib/apiJsonChai')
  , mongoose = require('mongoose')
  , server = require('../../lib/server.js')
  ;

chai.use( api_assertions );

// ## Naming Suites
// 
// Tests needs to be manageable as more and more are added to the code
// base.  The trick is to use a naming scheme that is describes the 
// type of test and the components it covers.
// 
// In this project, we consider two types of tests: UNIT and INTEGRATION.
// UNIT tests establish that a specific component behaves as it is
// intended to.  A unit test has two key characteristic:
//
// 1. It exercices error cases and ensures that all code pathes
//    in the component behaves as expected.
// 2. It has no external dependencies, therefore it can run on the 
//    local machine without any network or required software install.
//
// The second type of test are INTEGRATION tests.  These tests are 
// designed in a way to exercise the external interfaces of the
// application and observe expected outcomes. For these tests to 
// operate, it is expected that external dependent systems are made
// available and configured in a way to support their success.
//
// Integration tests can be ran on _any_ environment without negative
// functional impact to clients or the application.
//
// When describing a test, one should specify it's major type.  It is
// one of INTEGRATION or UNIT.
describe('INTEGRATION Route', function () {

  var url = server.url
    , app = server.app
    ;


  before(function (done) {
    server.ready(done);
  });

  // after(function(done) {
  //   if (app) {
  //     // Shutdown the app
  //     app.close( done );
  //   } else {//     done();
  //   }
  // });

  describe( 'GET #/test', function() {
    it('should return the static test response', function (done) {
      request(url)
            .get('/test')
            .set('Accept', 'application/json')
            .expect('Content-Type', 'application/json')
            .expect(200)
            .end(function (err, res) {
              if (err) return done(err);
              var resp = res.body;
              resp.should.be.an('object');
              resp.result.should.equal("test");
              return done();
            });
    });
  });

  describe( 'GET #/version', function() {

    function getVersion() {
      return require('../../../package.json').version;
    }

    it('should return the current version number', function (done) {
      request(url)
            .get('/version')
            .set('Accept', 'application/json')
            .expect('Content-Type', 'application/json')
            .expect(200)
            .end(function (err, res) {
              if (err) return done(err);
              var resp = res.body;
              resp.should.be.an('object');
              resp.version.should.equal( getVersion() );
              return done();
            });
    });
  });
  
});  // INTEGRATION


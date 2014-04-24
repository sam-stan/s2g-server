'use strict';

var server = require('../../lib/server.js')
  , url = server.url
  , request = require('supertest')
  , chai = require('chai')
  , expect = chai.expect
  , logger = require('../../../app/logging').logger
  , mongoose = require('mongoose')
  , accountFactory = require('../../lib/accountFactory.js')
  ;

describe( 'INTEGRATION #/neighborhoods', function() {

  describe( 'GET #/neighborhoods', function() {
    it('should return the route response', function (done) {
      request(url)
            .get('/neighborhoods')
            .set('Accept', 'application/json')
            .expect('Content-Type', 'application/json')
            .expect(200)
            .end(function (err, res) {
              if (err) return done(err);
              res.body.should.exist.and.be.an.apiResponseJSON('success');
              res.body.should.have.a.property('data').that.is.an('array');
              for (var i = res.body.data.length - 1; i >= 0; i--) {
                res.body.data[i].should.be.a.neighborhoodJSON;
              }
              return done();
            });
    });
  });

  describe.skip( 'GET #/neighborhoods?address=:address', function () {

  });

  describe.skip( 'GET #/neighborhoods/:neighborhood/items', function () {

  });

  describe.skip( 'GET #/neighborhoods/:neighborhood/items/:item', function () {

  });

  describe.skip( 'GET #/neighborhoods/:neighborhood/statistics', function () {

  });

});
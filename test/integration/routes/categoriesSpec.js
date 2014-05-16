'use strict';

var server = require('../../lib/server.js')
  , url = server.url
  , request = require('supertest')
  , chai = require('chai')
  , expect = chai.expect
  , logger = require('../../../app/logging').logger
  , mongoose = require('mongoose')
  ;

  describe( 'INTEGRATION #/categories', function() {

    describe('GET #/categories', function() {

      it('should return an array of category names', function(done) {
        request(url)
          .get('/categories')
          .set('Accept', 'application/json')
          .expect('Content-Type', 'application/json')
          .expect(200)
          .end(function(err, res) {
            if(err)
              return done(err);
            console.log('\n\n\n' + JSON.stringify(res.body) + '\n\n\n');
            res.body.should.exist.and.be.an.apiResponseJSON('success');
            res.body.should.have.property('data').to.have.length.above(1);
            done();
          });
      });
    });

  });

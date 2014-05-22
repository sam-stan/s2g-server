'use strict';

var server = require('../../lib/server.js')
  , url = server.url
  , request = require('supertest')
  , chai = require('chai')
  , expect = chai.expect
  , logger = require('../../../app/logging').logger
  , mongoose = require('mongoose')
  , Category = mongoose.model('Category')
  ;

describe( 'INTEGRATION #/categories', function() {

  before(function(done) {
    var category = new Category({name: 'tools'});
    category.save(function(err) {
      if(err) done(err);
      done();
    });
  });

  after(function(done) {
    Category.remove({ name: 'tools' }, function(err) {
      if(err) done(err);
      done();
    });
  });

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
          res.body.should.exist.and.be.an.apiResponseJSON('success');
          res.body.should.have.property('data').to.have.length.above(0);
          done();
        });
    });
  });

});

'use strict';

var server = require('../../lib/server.js')
  , url = server.url
  , request = require('supertest')
  , chai = require('chai')
  , apiAssertions = require('../../lib/apiJsonChai.js')
  , expect = chai.expect
  , logger = require('../../../app/logging').logger
  , mongoose = require('mongoose')
  , sampleFactory = require('../../lib/sampleFactory.js')
  , accountFactory = require('../../lib/accountFactory.js')
  , Sample = mongoose.model('Sample')
  // , q = require('q')
  ;

chai.use( apiAssertions );


describe( 'INTEGRATION #/samples', function() {

  var account;

  before( function (done) {
    server.ready( function () {
      accountFactory.createAuthenticatedAccount(url)
      .then( function (result) {
        account = result;
        done();
      })
      .fail(done);
    });
  });

  after( function (done) {
    account.deleteAccount().then(done).fail(done);
  });

  describe('GET #/samples', function () {

    it('should require authentication', function (done) {
      request(url)
        .get('/samples')
        .expect(401)
        .end(done);
    });

    it('should return an as an array, even if there are no samples', function (done) {
      request(url)
        .get('/samples')
        .set('Authorization', 'Bearer ' + account.oauth2.access_token)
        .expect(200)
        .expect(function (res) {
          console.dir(res.body);
          res.body.should.exist.and.be.an.apiResponseJSON('success');
          res.body.data.should.exist.and.be.a.samplesJSON;
        })
        .end(done);
    });

  });

  describe('PUT #/samples', function () {
    var objectId = new mongoose.Types.ObjectId();
    var category = {
        id: objectId,
        name: 'Some Category',
        type: 'item',
        categories: ['some category'],
        tags: ['a tag'],
        image: 'http://image.url.png'
      };

    it('should require authentication', function (done) {
      request(url)
        .put('/samples/' + category.id)
        .send(category)
        .expect(401)
        .end(done);
    });
    it('should create a sample from json with specific id', function (done) {
      request(url)
        .put('/samples/' + category.id)
        .set('Authorization', 'Bearer ' + account.oauth2.access_token)
        .send(category)
        .expect(201)
        .end( function (err,res) {
          if (err) return done(err);
          request(url)
            .get('/samples/' + category.id)
            .set('Authorization', 'Bearer ' + account.oauth2.access_token)
            .expect(200, function (res) {
              res.body.should.exist.and.be.an.apiResponseJSON('success');
              res.body.data.should.exist.and.be.a.samplesJSON;
              res.body.data[0].should.exist.and.be.a.sampleJSON;              
            })
            .end(done);
        });
    });
  });

  describe('POST #/samples', function () {
    var category = {
        name: 'Some Category',
        type: 'item',
        categories: ['some category'],
        tags: ['a tag'],
        image: 'http://image.url.png'
      };

    var sample;

    it('should require authentication', function (done) {
      request(url)
        .post('/samples')
        .send(category)
        .expect(401)
        .end(done);
    });

    it('should create a sample with a posted JSON body', function (done) {

      request(url)
        .post('/samples')
        .set('Authorization', 'Bearer ' + account.oauth2.access_token)
        .send(category)
        .expect(201)
        .expect(function (res) {
          res.body.should.exist.and.be.an.apiResponseJSON('success');
          res.body.data.should.exist.and.be.a.sampleJSON;
          category.id = res.body.data.id;
          res.body.data.should.deep.equal(category);
          sample = res.body.data;
        })
        .end(done); 
    });

    after( function() {
      // make sure to cleanup whatever was created.
      Sample.remove( { _id: sample.id}, function (err) {
        if (err) {
          logger.warn('Failed to remove test sample id: ' + sample.id);
        }
      });
    });
  });

  describe('GET #/samples', function () {

    var samples;

    before( function (done) {
      server.ready( function () {
        sampleFactory.createOne(url, account.oauth2.access_token)
        .then( function (s) {
          samples = s;
          done();
        })
        .fail(done);
      });
    });

    after( function (done) {
      samples.removeAll().then(done).fail(done);
    });

    it('should return the list of samples of at least 1', function (done) {
      request(url)
        .get('/samples')
        .set('Authorization', 'Bearer ' + account.oauth2.access_token)
        .expect(200)
        .expect(function (res) {
          res.body.should.exist.and.be.an.apiResponseJSON('success');
          res.body.data.should.exist.and.be.a.samplesJSON;
          res.body.data[0].should.exist.and.be.a.sampleJSON;
        })
        .end(done);
    });

    describe('GET #/samples/:id', function () {
      it('should get a sample by id', function (done) {
        request(url)
          .get('/samples/' + samples.samples[0].id)
          .set('Authorization', 'Bearer ' + account.oauth2.access_token)
          .expect(200)
          .expect(function (res){
            res.body.should.exist.and.be.an.apiResponseJSON('success');
            res.body.data.should.exist.and.be.a.sampleJSON;
            res.body.data.should.deep.equal(samples.samples[0]);            
          })
          .end(done);
      });
    });

    describe('DELETE #/samples/:id', function () {
      it('should remove a sample by id', function (done) {
        request(url)
          .del('/samples/' + samples.samples[0].id)
          .set('Authorization', 'Bearer ' + account.oauth2.access_token)
          .expect(204)
          .end( function (err, res) {
            if (err) return done(err);
            request(url)
              .get('/samples/' + samples.samples[0].id)
              .set('Authorization', 'Bearer ' + account.oauth2.access_token)
              .expect(404)
              .end(done);
          });
      });
    });

  });

});

'use strict';

var server = require('../../lib/server.js')
  , url = server.url
  , request = require('supertest')
  , chai = require('chai')
  , expect = chai.expect
  , logger = require('../../../app/logging').logger
  , mongoose = require('mongoose')
  , accountFactory = require('../../lib/accountFactory.js')
  , utils = require('../../lib/utils.js')
  , api_assertions = require('../../lib/apiJsonChai')
  ;

chai.use( api_assertions );

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
    var homeAddress = { address: '1410 NE 70th St. Seattle, WA 98144' };

    it ('should be a protected resource', function (done) {
      request(url)
      .get('/neighborhoods')
      .query(homeAddress)
      .set('Accept', 'application/json')
      .expect('Content-Type', 'application/json')
      .expect(401)
      .end(done);
    });
    it ('should require HTTP Basic Auth', function (done) {
      request(url)
      .get('/neighborhoods')
      .query(homeAddress)
      .auth(utils.apiClient.user, utils.apiClient.key)
      .set('Accept', 'application/json')
      .expect('Content-Type', 'application/json')
      .expect(200)
      .end(done);
    });
    it ('should return a neighborhood', function (done) {
      request(url)
      .get('/neighborhoods')
      .query(homeAddress)
      .auth(utils.apiClient.user, utils.apiClient.key)
      .set('Accept', 'application/json')
      .expect('Content-Type', 'application/json')
      .expect(200)
      .end(function (err,res) {
        if (err) return done(err);
        res.body.should.exist.and.be.an.apiResponseJSON('success');
        res.body.should.have.a.property('data').that.is.a.neighborhoodJSON;
        done();
      });
    });
  });

  describe.skip( '', function () {
    var homeAddress = { address: '1410 NE 70th St. Seattle, WA 98144' };
    var account;
    var accountInSameNeighborhood;
    var accountInOtherNeighborhood;
    var itemsA = [];
    var itemsB = [];

    before( function () {
      // TODO: user needs a neighborhood
      server.ready( function (done) {
        accountFactory.createAuthenticatedAccount(url)
        .then( function (result) {
          account = result;
          accountFactory.createAuthenticatedAccount(url)
          .then( function (result) {
            accountInSameNeighborhood = result;
            accountFactory.createAuthenticatedAccount(url)
            .then( function (result) {
              accountInOtherNeighborhood = result;
              done();
            });
          });
        });
      });

      // TODO: use PUT users/.../items to add some items
      //       those items need a neighborhood property
      //       Save those items in itemsA and itemsB for 
      //       later tests.
      //  
    });

    after( function (done) {
      // Cleanup the items and the test user.
      account.deleteAccount()
      .then(accountInSameNeighborhood.deleteAccount)
      .then(accountInOtherNeighborhood.deleteAccount)
      .then(done);

      // TODO: delete the items too!
    });

    describe.skip( 'GET #/neighborhoods/:neighborhood/items', function () {
      it ('should be a protected resource', function (done) {
        request(url)
        .get('/neighborhoods/' + account.neighborhood + '/items')
        .set('Accept', 'application/json')
        .expect('Content-Type', 'application/json')
        .expect(401)
        .end(done);
      });
      it ('should require an Oauth token', function (done) {
        request(url)
        .get('/neighborhoods/' + account.neighborhood + '/items')
        .set('Authorization', 'Bearer ' + account.oauth2.access_token)
        .set('Accept', 'application/json')
        .expect('Content-Type', 'application/json')
        .expect(200)
        .end(done);
      });
      it ('should return a list of items', function (done) {
        request(url)
        .get('/neighborhoods/' + account.neighborhood + '/items')
        .set('Authorization', 'Bearer ' + account.oauth2.access_token)
        .set('Accept', 'application/json')
        .expect('Content-Type', 'application/json')
        .expect(200)
        .end(function (err,res) {
          if (err) return done();
          res.body.should.exist.and.be.an.apiResponseJSON('success');
          res.body.should.have.a.property('data').that.is.an('array');
          for (var i = res.body.data.length - 1; i >= 0; i--) {
            res.body.data[i].should.be.a.itemJSON;
          }
          done();
        });
      });
      it ('should return items of all users in that neighbhorhood', function (done) {
        request(url)
        .get('/neighborhoods/' + account.neighborhood + '/items')
        .set('Authorization', 'Bearer ' + account.oauth2.access_token)
        .set('Accept', 'application/json')
        .expect('Content-Type', 'application/json')
        .expect(200)
        .end(function (err,res) {
          itemsA.should.not.be.empty;
          if (err) return done();
          res.body.should.exist.and.be.an.apiResponseJSON('success');
          res.body.should.have.a.property('data').that.is.an('array');
          for (var i = res.body.data.length - 1; i >= 0; i--) {
            res.body.data[i].should.be.a.itemJSON;
          }
          // TODO: compare that itemsA and this response have the exact same items.
          done();
        });
      });
      it ('should not have items from users not in that neighborhood', function (done) {
        request(url)
        .get('/neighborhoods/' + account.neighborhood + '/items')
        .set('Authorization', 'Bearer ' + account.oauth2.access_token)
        .set('Accept', 'application/json')
        .expect('Content-Type', 'application/json')
        .expect(200)
        .end(function (err,res) {
          if (err) return done();
          itemsB.should.not.be.empty;
          res.body.should.exist.and.be.an.apiResponseJSON('success');
          res.body.should.have.a.property('data').that.is.an('array');
          for (var i = res.body.data.length - 1; i >= 0; i--) {
            res.body.data[i].should.be.a.itemJSON;
          }
          // TODO: compare that no items in itemsB are in this response.
          done();
        });
      });
    });

    describe.skip( 'GET #/neighborhoods/:neighborhood/items/:item', function () {
      it ('should be a protected resource', function (done) {
        itemsA.should.not.be.empty;
        request(url)
        .get('/neighborhoods/' + account.neighborhood + '/items/' + itemsA[0])
        .set('Accept', 'application/json')
        .expect('Content-Type', 'application/json')
        .expect(401)
        .end(done);
      });
      it ('should require an Oauth token', function (done) {
        itemsA.should.not.be.empty;
        request(url)
        .get('/neighborhoods/' + account.neighborhood + '/items/' + itemsA[0])
        .set('Authorization', 'Bearer ' + account.oauth2.access_token)
        .set('Accept', 'application/json')
        .expect('Content-Type', 'application/json')
        .expect(200)
        .end(done);
      });
      it ('should return a specific item', function (done) {
        itemsA.should.not.be.empty;
        request(url)
        .get('/neighborhoods/' + account.neighborhood + '/items/' + itemsA[0])
        .set('Accept', 'application/json')
        .expect('Content-Type', 'application/json')
        .expect(200)
        .end(function (err,res) {
          if (err) return done();
          res.body.should.exist.and.be.an.apiResponseJSON('success');
          res.body.should.have.a.property('data').that.is.an.itemJSON;
          done();
        });
      });
      it ('should not return an item found in another neighborhood', function (done) {
        itemsA.should.not.be.empty;
        itemsB.should.not.be.empty;
        request(url)
        .get('/neighborhoods/' + account.neighborhood + '/items/' + itemsB[0])
        .set('Authorization', 'Bearer ' + account.oauth2.access_token)
        .set('Accept', 'application/json')
        .expect('Content-Type', 'application/json')
        .expect(404)
        .end(done);
      });
    });
  });

  describe.skip( 'GET #/neighborhoods/:neighborhood/statistics', function () {
    it ('should be a protected resource', function (done) {

    });
    it ('should require an Oauth token', function (done) {

    });
    it ('should return neighborhood statistics', function (done) {
      // just test the format of the response, this is likely to be
      // static data for now until we have a clearer idea.
    });
  });

});
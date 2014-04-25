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

describe.skip( 'INTEGRATION #/items', function() {

  var account;
  var accountInOtherNeighborhood;
  var itemsA = [];
  var itemsB = [];

  before( function (done) {
    server.ready( function () {
      accountFactory.createAuthenticatedAccount(url)
      .then( function (result) {
        account = result;
        accountFactory.createAuthenticatedAccount(url)
        .then( function (result) {
          accountInOtherNeighborhood = result;
          done();        
        });
      });
    });

    // TODO: Add some items to accounts
  });

  after( function (done) {
    account.deleteAccount()
    .then(accountInOtherNeighborhood.deleteAccount)
    .then(done);
  });

  describe('GET #/items', function () {

    it('should require authentication', function (done) {
      request(url)
        .get('/users/' + account.username + '/items')
        .set('Accept', 'application/json')
        .expect('Content-Type', 'application/json')
        .expect(401)
        .end(done);
    });

    it('should return all items', function (done) {
      itemsA.should.not.be.empty;
      itemsB.should.not.be.empty;
      var totalItems = itemsA.length + itemsB.length; 
      request(url)
        .get('/items')
        .set('Authorization', 'Bearer ' + account.oauth2.access_token)
        .set('Accept', 'application/json')
        .set('Content-Type', 'application/json')
        .expect(200)
        .end( function (err, res) {
          if (err) done(err);
          res.body.data.should.be.an.array;
          res.body.data.should.have.length(totalItems);
          // TODO: Verify that all items returned are exactly the same
          //       as the items in the itemsA and itemsB
          //       AND that they are itemJSONs
          done();
        });
    });

    it('should return a specific item', function (done) {
      itemsA.should.not.be.empty;
      itemsB.should.not.be.empty;      
      request(url)
        .get('/items/' + itemsA[0].id)
        .set('Authorization', 'Bearer ' + account.oauth2.access_token)
        .set('Accept', 'application/json')
        .set('Content-Type', 'application/json')
        .expect(200)
        .end( function (err, res) {
          if (err) done(err);
          res.body.data.should.be.an.array;
          res.body.data.should.have.length(1);
          // TODO: test taht it is an itemJSON
          done();
        });
    });      

  });

});
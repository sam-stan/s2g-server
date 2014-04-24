'use strict';

var server = require('../../../lib/server.js')
  , url = server.url
  , request = require('supertest')
  , chai = require('chai')
  , expect = chai.expect
  , logger = require('../../../../app/logging').logger
  , mongoose = require('mongoose')
  , accountFactory = require('../../../lib/accountFactory.js')
  ;

describe( 'INTEGRATION #/users', function() {

  var account;

  before( function (done) {
    server.ready( function () {
      accountFactory.createAuthenticatedAccount(url)
      .then( function (result) {
        account = result;
        console.log(account);
        done();
      });
    });
  });

  after( function (done) {
    account.deleteAccount().then(done);
  });

  describe('GET #/users/:username who doesn\'t exist', function () {

    it('should require authentication', function (done) {
      request(url)
        .get('/users/testUser')
        .set('Accept', 'application/json')
        .expect('Content-Type', 'application/json')
        .expect(401)
        .end(done);
    });

    it('should return a 404', function (done) {
      request(url)
        .get('/users/testUser')
        .set('Authorization', 'Bearer ' + account.oauth2.access_token)
        .set('Accept', 'application/json')
        .expect('Content-Type', 'application/json')
        .expect(404)
        .end(done);
    });
  }); // GET #/users/:username


  describe('PUT #/users/:username', function() {

    require('../../../../app/models/user');
    var User = mongoose.model('User');

    var tylerDurden = {
      firstName: 'Tyler',
      lastName: 'Durden',
      address: '1537 Paper Street, Bradford DE 19808',
      avatar: 'http://www.thedentedhelmet.com/uploads/avatars/avatar14_15.gif'
    };

    after( function() {
      // tidy up and delete the test account.
      User.remove( {username: account.username } , function(err) {
        if (err) {
          logger.warn( 'Failed to remove the users created during these tests: ' + err);
        }
      });
    });    

    it('should only let owning user account update the profile', function(done) {
      request(url)
        .put('/users/wrongUser' + Math.random() )
        .set('Authorization', 'Bearer ' + account.oauth2.access_token)
        .set('Content-Type', 'application/json')
        .send(tylerDurden)
        .expect(401)
        .end(done);
    });

    it('should return 201 when a document is saved', function (done) {
      request(url)
        .put('/users/' + account.username )
        .set('Authorization', 'Bearer ' + account.oauth2.access_token)
        .set('Accept', 'application/json')
        .set('Content-Type', 'application/json')
        .send(tylerDurden)
        .expect(201)
        .end(done);
    });

    it('should allow successive updates', function (done) {
      // first one (should do an updated if previous test was ran.)
      request(url)
        .put('/users/' + account.username )
        .set('Authorization', 'Bearer ' + account.oauth2.access_token)
        .set('Accept', 'application/json')
        .set('Content-Type', 'application/json')
        .send(tylerDurden)
        .expect(201)
        .end( function () {
          // second one.
          request(url)
            .put('/users/' + account.username )
            .set('Authorization', 'Bearer ' + account.oauth2.access_token)
            .set('Accept', 'application/json')
            .set('Content-Type', 'application/json')
            .send(JSON.stringify({
              firstName: 'Tyler',
              lastName: 'Durden',
              address: '1537 Paper Street, Bradford DE 19808',
              avatar: 'http://www.thedentedhelmet.com/uploads/avatars/avatar14_15.gif'
            }))
            .expect(201)
            .end(done);
        }); 
    });

    describe('GET #/users/:username', function () {

      before(function (done) {
        request(url)
          .put('/users/' + account.username )
          .set('Authorization', 'Bearer ' + account.oauth2.access_token)
          .set('Accept', 'application/json')
          .set('Content-Type', 'application/json')
          .send( tylerDurden)
          .expect(201)
          .end(done);
      });

      it('should return an existing user', function (done) {
        request(url)
          .get('/users/' + account.username )
          .set('Authorization', 'Bearer ' + account.oauth2.access_token)
          .set('Accept', 'application/json')
          .set('Content-Type', 'application/json')
          .expect(200)
          .end(done);  
      });
    });
  });

});
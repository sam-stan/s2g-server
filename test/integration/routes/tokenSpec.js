'use strict';

var server = require('../../lib/server.js')
  , url = server.url
  , request = require('supertest')
  , chai = require('chai')
  , expect = chai.expect
  , logger = require('../../../app/logging').logger
  , mongoose = require('mongoose')
  ;

describe( 'INTEGRATION #/token', function() {

  var app = server.app;

  before( function (done) {
    server.ready(done);
  });

  // after(function(done) {
  //   if (app) {
  //     // Shutdown the app
  //     app.close( done );
  //   } else {
  //     done();
  //   }
  // });

  describe('Oauth2 secured APIs', function () {
    require('../../../app/models/account');
    var mongoose = require('mongoose');
    var Account = mongoose.model('Account');

    var testUser;
    var testPassword = 'iheartpeanuts';

    before( function (done) {
        // Ensure that babar is registered.
      request(url)
        .post('/accounts')
        .query( {email: testUser = Math.random() + '@share2give.lan'} )
        .query( {password: testPassword })
        .set('Accept', 'application/json')
        .expect('Content-Type', 'application/json')
        .expect(200)
        .end(done);      
    });

    after( function() {
      // tidy up and delete the test account.
      Account.remove( {email: testUser } , function(err) {
        if (err) {
          logger.warn( 'Failed to remove the test accounts: ' + err );
        }
      });
    });

    describe('POST #/token', function () {

      require('../../../app/models/oauth2token');
      var mongoose = require('mongoose');
      var Oauth2Token = mongoose.model('Oauth2Token');

      it('requires basic_auth, grant_type, username and password', function (done) {
        request(url)
          .post('/token')
          .type('form')
          .auth('officialApiClient', 'C0FFEE')
          .type('form')
          .send({
            grant_type: 'password',
            username: testUser,
            password: testPassword,
          })
          .expect(200)
          .end(function (err, res) {
            if (err) done(err);
            res.body.should.exist.and.be.an.oauthAccessTokenResponseJSON; 
            done();
          });
      });

      after( function() {
        // tidy up and delete the test account.
        Oauth2Token.remove( {email: /@share2give.lan/i } , function(err) {
          if (err) {
            logger.warn( 'Failed to remove the auth tokens for the test accounts: ' + err );
          }
        });
      });

    });  // #/token
  });
});
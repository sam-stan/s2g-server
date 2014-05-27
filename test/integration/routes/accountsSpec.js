'use strict';

var server = require('../../lib/server.js')
  , url = server.url
  , request = require('supertest')
  , chai = require('chai')
  , expect = chai.expect
  , logger = require('../../../app/logging').logger
  , mongoose = require('mongoose')
  , api_assertions = require('../../lib/apiJsonChai')
  , accountFactory = require('../../lib/accountFactory.js')
  ;

chai.use( api_assertions );

describe( 'INTEGRATION #/accounts', function () {
  require('../../../app/models/account');
  var Account = mongoose.model('Account');
  var account;

  before( function (done) {
    server.ready( function () {
      accountFactory.createAuthenticatedAccount(url)
      .then( function (result) {
        account = result;
        done();
      });
    });
  });

  after( function() {
    console.log('expecting to delete /@share2give.lan/i');
    // tidy up and delete the test account.
    Account.remove( {email: /@share2give.lan/i } , function(err) {
      if (err) {
        logger.warn( 'Failed to remove the test accounts: ' + err );
      }
    });
  });

  describe( 'POST #/accounts', function () {

    it('should create an account with a query string', function (done) {
      request(url)
      .post('/accounts')
      .query( {email: Math.random() + '@share2give.lan'} )
      .query( {password: 'a wonderful day'})
      .query( {neighborhood: mongoose.Types.ObjectId().toString()})
      .set('Accept', 'application/json')
      .expect('Content-Type', 'application/json')
      .expect(200)
      .end(function (err, res) {
        if (err) return done(err);    
        res.body.should.exist.and.be.an.apiResponseJSON('success');
        res.body.should.have.property('data').that.is.an.accountDetailJSON;
        return done();      
      });
    });

    it('should create an account with a posted JSON body', function (done) {
      request(url)
      .post('/accounts')
      .send( {email: Math.random() + '@share2give.lan'} )
      .send( {password: 'a wonderful day'})
      .send( {neighborhood: mongoose.Types.ObjectId().toString()})
      .set('Accept', 'application/json')
      .expect('Content-Type', 'application/json')
      .expect(200)
      .end(function (err, res) {
        if (err) return done(err);    
        res.body.should.exist.and.be.an.apiResponseJSON('success');
        res.body.should.have.property('data').that.is.an.accountDetailJSON;
        return done();      
      });
    });
  });

  describe('GET #/accounts/:username who doesn\'t exist', function () {

    it('should require authentication', function (done) {
      request(url)
        .get('/accounts/testUser')
        .set('Accept', 'application/json')
        .expect('Content-Type', 'application/json')
        .expect(401)
        .end(done);
    });

    it('should return a 404', function (done) {
      request(url)
        .get('/accounts/testUser')
        .set('Authorization', 'Bearer ' + account.oauth2.access_token)
        .set('Accept', 'application/json')
        .expect('Content-Type', 'application/json')
        .expect(404)
        .end(done);
    });
  }); // GET #/accounts/:username


  describe('PUT #/accounts/:username', function() {

    var tylerDurden = {
      firstName: 'Tyler',
      lastName: 'Durden',
      address: '1537 Paper Street, Bradford DE 19808',
      avatar: 'http://www.thedentedhelmet.com/uploads/avatars/avatar14_15.gif'
    };

    it('should only let owning user account update the profile', function(done) {
      request(url)
        .put('/accounts/wrongUser' + Math.random() )
        .set('Authorization', 'Bearer ' + account.oauth2.access_token)
        .set('Content-Type', 'application/json')
        .send(tylerDurden)
        .expect(401)
        .end(done);
    });

    it('should return 201 when a document is saved', function (done) {
      request(url)
        .put('/accounts/' + account.username )
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
        .put('/accounts/' + account.username )
        .set('Authorization', 'Bearer ' + account.oauth2.access_token)
        .set('Accept', 'application/json')
        .set('Content-Type', 'application/json')
        .send(tylerDurden)
        .expect(201)
        .end( function () {
          // second one.
          request(url)
            .put('/accounts/' + account.username )
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

    describe('GET #/accounts/:username', function () {

      before(function (done) {
        request(url)
          .put('/accounts/' + account.username )
          .set('Authorization', 'Bearer ' + account.oauth2.access_token)
          .set('Accept', 'application/json')
          .set('Content-Type', 'application/json')
          .send( tylerDurden)
          .expect(201)
          .end(done);
      });

      it('should return an existing user', function (done) {
        request(url)
          .get('/accounts/' + account.username )
          .set('Authorization', 'Bearer ' + account.oauth2.access_token)
          .set('Accept', 'application/json')
          .set('Content-Type', 'application/json')
          .expect(200)
          .end(done);  
      });

      it('should return a user with a posted JSON body', function(done) {
        request(url)
          .get('/accounts/' + account.username )
          .set('Authorization', 'Bearer ' + account.oauth2.access_token)
          .set('Accept', 'application/json')
          .set('Content-Type', 'application/json')
          .expect(200)
          .end(function(err, res) {
            if (err) return done(err);    
            res.body.should.exist.and.be.an.apiResponseJSON('success');
            res.body.should.have.property('data').that.is.an.accountDetailJSON;
            res.body.should.have.property('data').that.is.an.userDetailJSON;
            return done();
          });
      });
    });
  });

  describe.skip('PUT #/accounts/:username/address', function () {
    
  });

  describe.skip( 'GET #/accounts/:username/feed', function ()  {

  });


  describe( 'GET #/accounts', function () {

  });

  describe( 'PUT #/accounts/:username/facebookId', function () {
    var account;
    before( function (done) {
      server.ready( function () {
        accountFactory.createAuthenticatedAccount(url)
        .then( function (result) {
          account = result;
          done();
        });
      });
    });

    it('should verify if the content is Json And Valid FBID', function (done) {            
      request(url)
      .put('/accounts')
      .query({username:account.username})
      .query({facebookId:'testtime2'})
      .set('Accept', 'application/json')
      .expect('Content-Type', 'application/json')
      .expect(200)
      .end(function (err, res) {
        if (err) return done(err);
        res.body.should.exist.and.be.an.apiResponseJSON('success');
        res.body.data.facebookId.should.be.an.facebookId;
        return done();
      });
    }); 

    it('should verify if the facebookId Exist', function (done) {            
      request(url)
      .put('/accounts/facebookId')
      .query({facebookId:'testtime2'})
      .set('Accept', 'application/json')
      .expect('Content-Type', 'application/json')
      .expect(200)
      .end(function (err, res) {
        if (err) return done(err);
        res.body.should.exist.and.be.an.apiResponseJSON('success');
        res.body.data.facebookId.should.be.an.facebookId;
        return done();
      });
    }); 

    after( function (done) {
      account.deleteAccount()
      .then(done);
    });
  });

  describe.skip( 'POST #/accounts/:username/password?reset=sms', function () {

  });

  describe.skip( 'GET #/accounts/:username/fyp/:code', function () {

  });

  describe.skip( 'PUT #/accounts/:username/password', function () {

  });

  describe.skip( 'FYP: Forgot Your Password', function () {

  });

});

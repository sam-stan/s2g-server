'use strict';

var server = require('../../lib/server.js')
  , url = server.url
  , request = require('supertest')
  , chai = require('chai')
  , expect = chai.expect
  , logger = require('../../../app/logging').logger
  , mongoose = require('mongoose')
  , api_assertions = require('../../lib/apiJsonChai')
  ;

chai.use( api_assertions );

describe( 'INTEGRATION #/accounts', function () {

  before( function (done) {
    server.ready(done);
  });

  describe( 'POST #/accounts', function () {

    require('../../../app/models/account');
    var Account = mongoose.model('Account');

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

    after( function() {
      console.log('expecting to delete /@share2give.lan/i');
      // tidy up and delete the test account.
      Account.remove( {email: /@share2give.lan/i } , function(err) {
        if (err) {
          logger.warn( 'Failed to remove the test accounts: ' + err );
        }
      });
    });
  });

  describe( 'GET #/accounts', function () {

  });

  describe( 'PUT #/accounts/:username/facebookId', function () {
      require('../../../app/models/account');
      require('../../../app/models/user');
      var Account = mongoose.model('Account');
      before(function (done) {
        var account = new Account({
        email: 'test@share2give.lan',
        password: 'a wonderful day',
        _neighborhood: mongoose.Types.ObjectId().toString()
       });
        account.save( function (err) {
          try {
            if (err) console.log(err);
          }
          catch (error) {
            console.log(error);
          }
       });
       server.ready(done);
     });
     it('should verify if the content is Json And Valid FBID', function (done) {            
       request(url)
       .put('/accounts')
       .query({username:'test@share2give.lan'})
       .query({facebookId:'testtime2'})
       .set('Accept', 'application/json')
       .expect('Content-Type', 'application/json')
       .expect(200)
       .end(function (err, res) {
        if (err) return done(err);
          res.body.should.exist.and.be.an.apiResponseJSON('success');
          res.body.should.have.property('data').that.is.an.accountDetailJSON2//Will be updated to accountDetailJSON after your confirmation
          return done();
        });
    }); 
    after( function() {
      console.log('expecting to delete test@share2give.lan');
      // tidy up and delete the test account.
      Account.remove( {
        email: 'test@share2give.lan'
      } , function(err) {
        if (err) {
          logger.warn( 'Failed to remove the test accounts: ' + err );
        }
     });
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

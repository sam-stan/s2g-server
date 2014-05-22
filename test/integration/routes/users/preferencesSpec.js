'use strict';

var server = require('../../../lib/server.js')
  , url = server.url
  , request = require('supertest')
  , chai = require('chai')
  , expect = chai.expect
  , logger = require('../../../../app/logging').logger
  , mongoose = require('mongoose')
  , Account = mongoose.model('Account')
  , Preferences = mongoose.model('Preferences')
  , accountFactory = require('../../../lib/accountFactory.js')
  ;

describe('INTEGRATION #/users/:username/preferences', function() {
  var account, preferences_id;

  before( function (done) {
    server.ready( function () {
      accountFactory.createAuthenticatedAccount(url)
      .then( function (result) {
        account = result;
        done();
      });
    });
  });

  after( function (done) {
    // done();
    account.deleteAccount().then(function() {
      Preferences.remove({ _id: preferences_id }, function() {
        done();
      });
    });
  });

  describe('GET #/users/:username/preferences', function() {
    it('should require authentication', function (done) {
      request(url)
        .get('/users/' + account.username + '/preferences')
        .set('Accept', 'application/json')
        .expect('Content-Type', 'application/json')
        .expect(401)
        .end(done);
    });

    it('should return a blank preferences object if not set yet', function(done) {
      request(url)
        .get('/users/' + account.username + '/preferences')
        .set('Authorization', 'Bearer ' + account.oauth2.access_token)
        .set('Accept', 'application/json')
        .expect('Content-Type', 'application/json')
        .expect(200)
        .end(function(err, res) {
          if(err) done(err);
          res.body.should.exist.and.be.an.apiResponseJSON('success');
          res.body.should.have.property('data').that.is.a.userPreferencesJSON;
          // Save _id to remove later
          preferences_id = res.body.data._id;
          done();
        });
    });

    it('should return the preferences object if created', function(done) {
      request(url)
        .get('/users/' + account.username + '/preferences')
        .set('Authorization', 'Bearer ' + account.oauth2.access_token)
        .set('Accept', 'application/json')
        .expect('Content-Type', 'application/json')
        .expect(200)
        .end(function(err, res) {
          if(err) done(err);
          res.body.should.exist.and.be.an.apiResponseJSON('success');
          res.body.should.have.property('data').that.is.a.userPreferencesJSON;
          done();
        });
    });

    it('should return a 404 if preferences _id is wrong in account object', function(done) {
      accountFactory.createAuthenticatedAccount(url)
      .then( function (result) {
        Account.update({ email: result.username }, { preferences: "5355f55407dd150200206883" }, function(err, numAffected) {
          request(url)
            .get('/users/' + result.username + '/preferences')
            .set('Authorization', 'Bearer ' + result.oauth2.access_token)
            .set('Accept', 'application/json')
            .expect('Content-Type', 'application/json')
            .expect(404)
            .end(function(err, res) {
              if(err) done(err);
              res.body.should.exist.and.be.an.apiResponseJSON('error');
              result.deleteAccount().then(function() {
                done();
              });
            });
        });
      });
    });

    describe.skip('PUT #/users/:username/preferences', function() {

    });

    describe('PUT #/users/:username/preferences/categories', function() {
      var categories = {
        categories: ['tools', 'services', 'outdoors']
      };

      it('should require authentication', function (done) {
        request(url)
          .put('/users/' + account.username + '/preferences/categories')
          .set('Accept', 'application/json')
          .send(categories)
          .expect('Content-Type', 'application/json')
          .expect(401)
          .end(done);
      });

      it('should only let owning user account update the preference categories', function(done) {
        request(url)
          .put('/users/' + account.username + Math.random() + '/preferences/categories' )
          .set('Authorization', 'Bearer ' + account.oauth2.access_token)
          .set('Content-Type', 'application/json')
          .send(categories)
          .expect(401)
          .end(done);
      });

      it('should return 201 when preferences saved', function (done) {
        request(url)
          .put('/users/' + account.username + '/preferences/categories' )
          .set('Authorization', 'Bearer ' + account.oauth2.access_token)
          .set('Accept', 'application/json')
          .set('Content-Type', 'application/json')
          .send(categories)
          .expect(201)
          .end(done);
      });

      it('should create a preferences object if one is not present', function(done) {
        accountFactory.createAuthenticatedAccount(url)
          .then( function (result) {
            request(url)
              .put('/users/' + result.username + '/preferences/categories' )
              .set('Authorization', 'Bearer ' + result.oauth2.access_token)
              .set('Accept', 'application/json')
              .set('Content-Type', 'application/json')
              .send(categories)
              .expect(201)
              .end(function(err, res) {
                if(err) done(err);
                Account.find({ email: result.username }, function (err, data) {
                  Preferences.remove({ _id: data[0].preferences }, function() {
                    result.deleteAccount().then(function() {
                      done();
                    });
                  });
                });
              });
          });
      });
    });

    describe('GET #/users/:username/preferences/categories', function() {
      it('should require authentication', function (done) {
        request(url)
          .get('/users/' + account.username + '/preferences/categories')
          .set('Accept', 'application/json')
          .expect('Content-Type', 'application/json')
          .expect(401)
          .end(done);
      });

      it('should return an array of categories when preferences found', function(done) {
        request(url)
          .get('/users/' + account.username + '/preferences/categories')
          .set('Authorization', 'Bearer ' + account.oauth2.access_token)
          .set('Accept', 'application/json')
          .expect('Content-Type', 'application/json')
          .expect(200)
          .end(function(err, res) {
            if(err) done(err);
            res.body.should.exist.and.be.an.apiResponseJSON('success');
            res.body.should.have.property('data').that.is.an.instanceOf(Array);
            done();
          });
      });
    });
  });

});

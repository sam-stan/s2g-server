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
  , Question = mongoose.model('Question')
  , accountFactory = require('../../../lib/accountFactory.js')
  ;

describe('INTEGRATION #/users/:username/questions', function() {
  var account, preferences_id, question_id;

  before( function (done) {
    server.ready( function () {
      accountFactory.createAuthenticatedAccount(url)
      .then( function (result) {
        account = result;
        var preferences = new Preferences();
        preferences.save(function(err, data) {
          if(err) done(err);
          preferences_id = data._id;
          Account.update({ email: account.username }, { preferences: preferences_id }, function(err, numAffected) {
            if(err) done(err);
            done();
          });
        });
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

  describe('GET #/users/:username/questions', function() {
    it('should require authentication', function (done) {
      request(url)
        .get('/users/' + account.username + '/questions')
        .set('Accept', 'application/json')
        .expect('Content-Type', 'application/json')
        .expect(401)
        .end(done);
    });

    it('should return a blank array if there are no questions stored', function(done) {
      request(url)
        .get('/users/' + account.username + '/questions')
        .set('Authorization', 'Bearer ' + account.oauth2.access_token)
        .set('Accept', 'application/json')
        .expect('Content-Type', 'application/json')
        .expect(200)
        .end(function(err, res) {
          if(err) done(err);
          res.body.should.exist.and.be.an.apiResponseJSON('success');
          res.body.should.have.property('data').that.is.a.userQuestionsJSON;
          done();
        });
    });

    it('should return an array of questions in user preferences', function(done) {
      var sampleQuestion = {
        _sample: preferences_id,
        type: 'lend',
        dateAsked: new Date()
      };

      Preferences.update({ _id: preferences_id }, 
        { $push: { samples: sampleQuestion }}, function(err) {
          if(err) done(err);
          request(url)
            .get('/users/' + account.username + '/questions')
            .set('Authorization', 'Bearer ' + account.oauth2.access_token)
            .set('Accept', 'application/json')
            .expect('Content-Type', 'application/json')
            .expect(200)
            .end(function(err, res) {
              if(err) done(err);
              res.body.should.exist.and.be.an.apiResponseJSON('success');
              res.body.should.have.property('data').that.is.a.userQuestionsJSON;
              question_id = res.body.data[0]._id;
              done();
            });
        });
    });

    describe('GET #/users/:username/questions/:id', function() {
      it('should require authentication', function (done) {
        request(url)
          .get('/users/' + account.username + '/questions/1')
          .set('Accept', 'application/json')
          .expect('Content-Type', 'application/json')
          .expect(401)
          .end(done);
      });

      it('should return the question with a valid id', function(done) {
        request(url)
          .get('/users/' + account.username + '/questions/' + question_id)
          .set('Authorization', 'Bearer ' + account.oauth2.access_token)
          .set('Accept', 'application/json')
          .expect('Content-Type', 'application/json')
          .expect(200)
          .end(function(err, res) {
            if(err) done(err);
            res.body.should.exist.and.be.an.apiResponseJSON('success');
            res.body.should.have.property('data').that.is.a.userQuestionJSON;
            res.body.data._id.should.equal(question_id);
            done();
          });
      });

      // Or, should we search the database for a question and
      // add it to the user's account?
      it('should return 400 if id is invalid', function(done) {
        request(url)
          .get('/users/' + account.username + '/questions/wrongId')
          .set('Authorization', 'Bearer ' + account.oauth2.access_token)
          .set('Accept', 'application/json')
          .expect('Content-Type', 'application/json')
          .expect(400)
          .end(done);
      });
    });

    describe.skip('PUT #/users/:username/questions', function() {

    });
  });

  describe('PUT #/users/:username/questions', function() {
    it('should require authentication', function (done) {
      request(url)
        .put('/users/' + account.username + '/questions/' + question_id)
        .set('Accept', 'application/json')
        .expect('Content-Type', 'application/json')
        .expect(401)
        .end(done);
    });

    it('should return 400 if id is invalid', function(done) {
      request(url)
        .put('/users/' + account.username + '/questions/wrongId')
        .set('Authorization', 'Bearer ' + account.oauth2.access_token)
        .set('Accept', 'application/json')
        .send({ response: true })
        .expect('Content-Type', 'application/json')
        .expect(400)
        .end(done);
    });

    it('should only let owning user account update the question', function(done) {
      request(url)
        .put('/users/' + account.username + Math.random() + '/questions/' + question_id )
        .set('Authorization', 'Bearer ' + account.oauth2.access_token)
        .set('Content-Type', 'application/json')
        .send({ response: true })
        .expect(401)
        .end(done);
    });

    it('should return 201 when a document is saved', function (done) {
      request(url)
        .put('/users/' + account.username + '/questions/' + question_id )
        .set('Authorization', 'Bearer ' + account.oauth2.access_token)
        .set('Accept', 'application/json')
        .set('Content-Type', 'application/json')
        .send({ response: true })
        .expect(201)
        .end(function() {
          Preferences.find({ _id: preferences_id }).exec(function(err, data) {
            if(err) done(err);
            var today = (new Date()).toDateString();
            data[0].samples[0].should.have.property('response').that.equals(true);
            expect(data[0].samples[0].dateAnswered.toDateString()).to.equal(today);
            done();
          });
        });
    });
  });

});

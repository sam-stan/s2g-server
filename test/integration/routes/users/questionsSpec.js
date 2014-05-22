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
  , Sample = mongoose.model('Sample')
  , accountFactory = require('../../../lib/accountFactory.js')
  , _ = require('underscore')
  ;

describe('INTEGRATION #/users/:username/preferences/questions', function() {
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
          Account.update({ email: account.username }, 
            { preferences: preferences_id }, function(err, numAffected) {
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

  describe('GET #/users/:username/preferences/questions', function() {
    it('should require authentication', function (done) {
      request(url)
        .get('/users/' + account.username + '/preferences/questions')
        .set('Accept', 'application/json')
        .expect('Content-Type', 'application/json')
        .expect(401)
        .end(done);
    });

    it('should return a blank array if there are no questions stored', function(done) {
      request(url)
        .get('/users/' + account.username + '/preferences/questions')
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
        _id: 'abc123-lend',
        _sample: {
          _id: 'abc123',
          name: 'Lawn mower',
          categories: [ 'tools'],
          image: 'http://flicker.com/myimage',
          tags: ['lawn', 'gas powered']
        },
        type: 'lend',
        dateAsked: new Date()
      };
      question_id = sampleQuestion._id;

      Preferences.update({ _id: preferences_id }, 
        { questions: { 'abc123-lend': sampleQuestion } }, function(err) {
          if(err) done(err);
          request(url)
            .get('/users/' + account.username + '/preferences/questions')
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

    it('should return a 404 if the preferences object was not found', function(done) {
      accountFactory.createAuthenticatedAccount(url)
      .then( function (result) {
        request(url)
            .get('/users/' + result.username + '/preferences/questions')
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

    describe('GET #/users/:username/preferences/questions/:id', function() {
      it('should require authentication', function (done) {
        request(url)
          .get('/users/' + account.username + '/preferences/questions/1')
          .set('Accept', 'application/json')
          .expect('Content-Type', 'application/json')
          .expect(401)
          .end(done);
      });

      it('should return the question with a valid id', function(done) {
        request(url)
          .get('/users/' + account.username + '/preferences/questions/' + question_id)
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
      it('should return 404 if id is invalid', function(done) {
        request(url)
          .get('/users/' + account.username + '/preferences/questions/wrongId')
          .set('Authorization', 'Bearer ' + account.oauth2.access_token)
          .set('Accept', 'application/json')
          .expect('Content-Type', 'application/json')
          .expect(404)
          .end(done);
      });
    });

    describe.skip('PUT #/users/:username/preferences/questions', function() {

    });
  });

  describe('PUT #/users/:username/preferences/questions/:id', function() {
    it('should require authentication', function (done) {
      request(url)
        .put('/users/' + account.username + '/preferences/questions/' + question_id)
        .set('Accept', 'application/json')
        .expect('Content-Type', 'application/json')
        .expect(401)
        .end(done);
    });

    it('should return 404 if id is invalid', function(done) {
      request(url)
        .put('/users/' + account.username + '/preferences/questions/wrongId')
        .set('Authorization', 'Bearer ' + account.oauth2.access_token)
        .set('Accept', 'application/json')
        .send({ response: true })
        .expect('Content-Type', 'application/json')
        .expect(404)
        .end(done);
    });

    it('should only let owning user account update the question', function(done) {
      request(url)
        .put('/users/' + account.username + Math.random() + '/preferences/questions/' + question_id )
        .set('Authorization', 'Bearer ' + account.oauth2.access_token)
        .set('Content-Type', 'application/json')
        .send({ response: true })
        .expect(401)
        .end(done);
    });

    it('should return 201 when a document is saved', function (done) {
      request(url)
        .put('/users/' + account.username + '/preferences/questions/' + question_id )
        .set('Authorization', 'Bearer ' + account.oauth2.access_token)
        .set('Accept', 'application/json')
        .set('Content-Type', 'application/json')
        .send({ response: true })
        .expect(201)
        .end(function() {
          Preferences.find({ _id: preferences_id }).exec(function(err, data) {
            if(err) done(err);
            var today = (new Date()).toDateString();
            data[0].questions[question_id].should.have.property('response').that.equals(true);
            expect(data[0].questions[question_id].dateAnswered.toDateString()).to.equal(today);
            done();
          });
        });
    });

    it('should return a 404 if the preferences object was not found', function(done) {
      accountFactory.createAuthenticatedAccount(url)
      .then( function (result) {
        request(url)
            .get('/users/' + result.username + '/preferences/questions/' + question_id )
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

  describe('GET #/users/:username/preferences/questions/new', function() {
    var questions = [];
    before(function(done) {
      var base_id = 'abc',
          samples = [];
      for(var i = 0; i < 10; ++i) {
        samples.push({
          name: i + ' big shovel',
          categories: ['tools'],
          image: 'http://such_a_tool.com/image.jpeg',
          tags: ['shovel', 'lawn care']
        });
      }

      Sample.create(samples, function(err) {
        if(err) done(err);
        done();
      });
    });

    after(function(done) {
      Sample.remove( { name: /big shovel/ }, function(err) {
        if(err) done(err);
        done();
      });
    });

    it('should require authentication', function (done) {
      request(url)
        .get('/users/' + account.username + '/preferences/questions/new')
        .set('Accept', 'application/json')
        .expect('Content-Type', 'application/json')
        .expect(401)
        .end(done);
    });

    it('should return 10 new questions if successful', function(done) {
      request(url)
        .get('/users/' + account.username + '/preferences/questions/new')
        .set('Authorization', 'Bearer ' + account.oauth2.access_token)
        .set('Accept', 'application/json')
        .expect('Content-Type', 'application/json')
        .expect(200)
        .end(function(err, res) {
          if(err) done(err);
          res.body.should.exist.and.be.an.apiResponseJSON('success');
          res.body.should.have.property('data').that.is.a.userQuestionsJSON;
          res.body.data.forEach(function(question) {
            questions.push(question._id);
          });
          res.body.data.length.should.equal(10);
          done();
        });
    });

    it('should not return any duplicate questions', function(done) {
      request(url)
        .get('/users/' + account.username + '/preferences/questions/new')
        .set('Authorization', 'Bearer ' + account.oauth2.access_token)
        .set('Accept', 'application/json')
        .expect('Content-Type', 'application/json')
        .expect(200)
        .end(function(err, res) {
          if(err) done(err);
          res.body.data.forEach(function(question) {
            questions.push(question._id);
          });
          res.body.should.exist.and.be.an.apiResponseJSON('success');
          res.body.should.have.property('data').that.is.a.userQuestionsJSON;
          expect(_.uniq(questions).length).to.equal(questions.length);
          done();
        });
    });

    it('should return a partial array if there are no more unique questions', function(done) {
      request(url)
        .get('/users/' + account.username + '/preferences/questions/new')
        .set('Authorization', 'Bearer ' + account.oauth2.access_token)
        .set('Accept', 'application/json')
        .expect('Content-Type', 'application/json')
        .expect(200)
        .end(function(err, res) {
          if(err) done(err);
          res.body.should.exist.and.be.an.apiResponseJSON('success');
          res.body.should.have.property('data').that.is.a.userQuestionsJSON;
          expect(res.body.data.length).to.be.lt(10);
          done();
        });
    });

    it('should return a 404 if the preferences object was not found', function(done) {
      accountFactory.createAuthenticatedAccount(url)
      .then( function (result) {
        request(url)
            .get('/users/' + result.username + '/preferences/questions/new')
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

});

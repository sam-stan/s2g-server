"use strict";

var chai = require('chai'),
    expect = chai.expect;

module.exports = function(chai, utils) {
  var Assertion = chai.Assertion;

  Assertion.addMethod('apiResponseJSON', function (code) {
    var response = this._obj;
    expect(response).to.be.an('object');
    expect(response).to.have.property('status');
    if (code) {
      expect(response.status).to.equal(code);
    }
  }); 

  Assertion.addProperty('twoLetterStateCode', function () {
    this.assert( this._obj.length === 2,
      'expected #{this} to be a #{exp} letter state code',
      'expected #{this} to not be a #{exp} letter state code',
      2);
  });

  Assertion.addProperty('twoLetterCountryCode', function () {
    this.assert( this._obj.length === 2,
      'expected #{this} to be a #{exp} letter country code',
      'expected #{this} to not be a #{exp} letter country code',
      2);
  });

  Assertion.addProperty('stateJSON', function () {
    var state = this._obj;
    expect(state.short, 'stateJSON.short').to.be.a.twoLetterStateCode;
    expect(state.long, 'stateJSON.long').to.be.a('string');
  });

  Assertion.addProperty('neighborhoodJSON', function () {
    var neighborhood = this._obj;
    expect(neighborhood,'neighborhoodJSON').to.be.an('object');
    expect(neighborhood,'neighborhoodJSON').to.have.property('name').that.is.a('string');
    expect(neighborhood,'neighborhoodJSON').to.have.property('city').that.is.a('string');
    expect(neighborhood,'neighborhoodJSON').to.have.property('country').that.is.a.twoLetterCountryCode;
    expect(neighborhood,'neighborhoodJSON').to.have.property('state').that.is.a.stateJSON;
  });

  Assertion.addProperty('email', function() {
    var filter = /[a-z0-9!#$%&'*+\/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+\/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/;
    expect(filter.test(this._obj)).to.be.true;
  });

  Assertion.addProperty('accountDetailJSON', function () {
    var detail = this._obj;
    expect(detail, 'accountDetailJSON').to.be.an('object');
    expect(detail, 'accountDetailJSON').to.have.property('id').that.is.a('string');
    expect(detail, 'accountDetailJSON').to.have.property('email').that.is.an.email;
  });

  Assertion.addProperty('userDetailJSON', function() {
    var detail = this._obj;
    expect(detail, 'userDetailJSON').to.have.property('firstName').that.is.a('string');
    expect(detail, 'userDetailJSON').to.have.property('lastName').that.is.a('string');
    expect(detail, 'userDetailJSON').to.have.property('address').that.is.a('string');
  });

  Assertion.addProperty('oauthAccessTokenResponseJSON', function () {
    var token = this._obj;
    expect(token, 'oauth2Response').to.be.an('object');
    expect(token, 'oauth2Response').to.have.property('access_token').that.is.a('string');
    expect(token, 'oauth2Response').to.have.property('token_type').that.equals('Bearer');
  });

  Assertion.addProperty('userPreferencesJSON', function () {
    var preferences = this._obj;
    expect(preferences, 'userPreferencesJSON').to.be.an('object');
    expect(preferences, 'userPreferencesJSON').to.have.property('categories').that.is.an.instanceOf(Array);
    expect(preferences, 'userPreferencesJSON').to.have.property('questions').that.is.an.instanceOf(Array);
    expect(preferences, 'userPreferencesJSON').to.have.property('lastUpdated').that.is.a('string');
  });

  Assertion.addProperty('userQuestionsJSON', function () {
    var questions = this._obj;
    expect(questions, 'userQuestionsJSON').to.be.an.instanceOf(Array);
    for (var i = 0; i < questions.length; ++i) {
      expect(questions[i]).to.be.a.userQuestionJSON;
    }
  });

  Assertion.addProperty('userQuestionJSON', function () {
    var question = this._obj;
    expect(question).to.be.an('object');
    expect(question).to.have.property('_sample').that.is.an('object');
    expect(question).to.have.property('type').that.is.a('string');
    expect(question).to.have.property('dateAsked').that.is.a('string');
  });

  Assertion.addProperty('samplesJSON', function () {
    var samples = this._obj;
    expect(samples, 'samplesJSON').to.be.an.instanceOf(Array);
    for (var i=0; i<samples.length; ++i) {
      expect(samples[i]).to.be.a.sampleJSON;
    }
  });

  Assertion.addProperty('sampleJSON', function () {
    var sample = this._obj;
    expect(sample).to.be.an('object');
    expect(sample).to.have.property('id').that.is.a('string');
    expect(sample).to.have.property('name').that.is.a('string');
    expect(sample).to.have.property('image').that.is.a('string');
    expect(sample).to.have.property('type').that.satisfy( function (t) {
      return t === 'item' || t === 'service';
    });
    expect(sample).to.have.property('tags').that.is.an.instanceOf(Array);
    for (var i=0; i<sample.tags.length; ++i) {
      expect(sample.tags[i]).to.be.a('string');
    }
    expect(sample).to.have.property('categories').that.is.an.instanceOf(Array);
    for (var j=0; j<sample.categories; ++j) {
      expect(sample.categories[j]).to.be.a('string');
    }
  });

};

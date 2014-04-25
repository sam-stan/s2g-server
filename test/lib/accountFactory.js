'use strict';

var q = require('q')
  , request = require('supertest')
  , logger = require('../../app/logging').logger
  ;

require('../../app/models/account');
require('../../app/models/oauth2token');
var mongoose = require('mongoose');
var Account = mongoose.model('Account');
var Oauth2Token = mongoose.model('Oauth2Token');

function UserAccount() {
  this.username = Math.random() + '@share2give.lan';
  this.password = this.username;

  this.deleteAccount = function () {
    var d = q.defer();
    Account.remove( {email: this.username}, function(err) {
      if (err) {
        logger.warn( 'Failed to remove test account %s', this.username);
        logger.warn(err);
      }
      Oauth2Token.remove( {email: this.username}, function(err) {
        if (err) {
          logger.warn( 'Failed to remove Oauth token for account %s', this.username);
          logger.warn(err);
        }
        d.resolve();
      });
    });
    return d.promise;
  };
}

exports.createAccount = function (url) {
  var d = q.defer();

  var account = new UserAccount();

  request(url)
  .post('/accounts')
  .query( {email: account.username} )
  .query( {password: account.password} )
  .query( {neighborhood: mongoose.Types.ObjectId().toString()})
  .set('Accept', 'application/json')
  .expect(200)
  .end( function () { 
    d.resolve(account);
  });

  return d.promise;
};

exports.createAuthenticatedAccount = function (url) {
  var d = q.defer();

  var accountPromise = exports.createAccount(url);
  
  accountPromise.then( function (account) {
    account.grant_type = 'password';
    request(url)
    .post('/token')
    .type('form')
    .auth('officialApiClient', 'C0FFEE')
    .send(account)
    .expect(200)
    .end( function (err,res) {
      account.oauth2 = res.body;
      d.resolve(account);
    });
  });

  return d.promise;
};


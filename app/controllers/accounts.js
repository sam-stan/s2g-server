'use strict';
var mongoose = require('mongoose')
  , Account = mongoose.model('Account')
  , logger = require('../logging').logger
  , utils = require('../utilities')
  , checkAccountError = utils.checkAccountError
  , checkError = utils.checkError
  ;

exports.create = function (req, res, next) {

  var account = new Account({
    email: req.params.email,
    password: req.params.password,
    _neighborhood: req.params.neighborhood
  });
  var reply = null;
  account.save( function (err) {
    try {
      checkError(err, res, next);

      res.send({
          status: 'success',
          data: {
            email: account.email,
            id: account.id
          }
        });
      return next();
    }
    catch (error) {
      console.log(error);
    }
  });
};

exports.get = function(req,res,next) {
  // logger.debug('#account.get');
  Account.find( {email: req.params.username} ).exec( function (err, d) {
    checkError(err, res, next);
    
    if (d.length < 1) {
      res.send(404, { status: 'error', message: 'user ' + req.params.username + ' not found.'});
      return next();
    }
    var data = d[0];

    res.send({
      status: 'success',
      data: {
        id: data._id,
        address: data.address,
        avatar: data.avatar,
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
	facebookId: data.facebookId,
      }
    });
    next();
  });
}; 

exports.put = function (req,res,next) {
  Account.find( {email: req.params.username} ).exec( function (err,d) {
    checkAccountError(err, d, req.params.email, res, next);    

    // logger.debug('#account.put');
    if(req.params.facebookId) {
      var update = {
        firstName: req.params.firstName,
        lastName: req.params.lastName,
        address: req.params.address,
        avatar: req.params.avatar,
        facebookId: req.params.facebookId
      };
    }
    else{
      var update = {
        firstName: req.params.firstName,
        lastName: req.params.lastName,
        address: req.params.address,
        avatar: req.params.avatar
      };
    }    
    
    Account.update( {email: req.params.username}, update, {upsert: true},
      function (err) {
      if (err) {
        logger.error('Failed to save user %s: %s', req.params.username, err);
        res.send(500,{
          status: 'error',
          message: err
        });
        return next();
      }
      res.send(201);
      return next();
    });
  });
};

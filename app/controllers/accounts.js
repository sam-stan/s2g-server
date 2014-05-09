'use strict';
var mongoose = require('mongoose')
  , Account = mongoose.model('Account')
  , logger = require('../logging').logger
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
      if (err) {
        console.log(err);
        res.send(500, {
          status: 'error',
          message: err
        });
        return next();
      }
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
    if (err) {
      // res.status(500);
      res.send(500, { status: 'error', message: err } );
      return next();
    } 
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
        lastName: data.lastName
      }
    });
    next();
  });
}; 

exports.put = function (req,res,next) {
  Account.find( {email: req.params.username} ).exec( function (err,d) {
    if (err) {
      logger.error(err);
      res.send(500, {
        status: 'error',
        message: err
      });
      return next();
    }
    console.log('\n\n\n' + JSON.stringify(d) + '\n\n\n');
    if ( d.length !== 1) {
      logger.error('user %s not found', req.params.username);
      res.send(400, {
        status: 'error',
        message: 'user ' + req.params.username + ' not found'
      });
      return next();
    }    

    // logger.debug('#account.put');
    var update = {
      firstName: req.params.firstName,
      lastName: req.params.lastName,
      address: req.params.address,
      avatar: req.params.avatar
    };
    
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

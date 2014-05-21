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

exports.update = function (req, res, next) {
  Account.findOne({email:req.params.username}, function (err,data) {
    if(err) {
      console.log(err);
      return next();
    }
    else {
      data.facebookId = req.params.facebookId;
      console.log(data);
      data.save( function (err) {
      try {
        if(err) {
          console.log('error');
          res.send(500,{
            status: 'error',
            message: err
          });
        }
        else {
          res.send({
            status: 'success',
            data: {
              email: data.email,
              facebookId: data.facebookId,
              id: data.id
            }
          });
        }
        return next();
      }
      catch (error) {
        console.log(error);
      }
      });
    }
  });   
};

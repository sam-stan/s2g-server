"use strict";

var logger = require('./logging').logger;

exports.checkAccountError = function( err, data, email, res, next) {
  if (err) {
    logger.error(err);
    res.send(500, {
      status: 'error',
      message: err
    });
    return next();
  }

  if ( data.length !== 1) {
    logger.error('user %s not found', email);
    res.send(400, {
      status: 'error',
      message: 'user ' + email + ' not found'
    });
    return next();
  }
};

exports.checkError = function(err, res, next) {
  if (err) {
    logger.error(err);
    res.send(500, {
      status: 'error',
      message: err
    });
    return next();
  }
};

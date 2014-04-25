'use strict';

var mongoose = require('mongoose')
  , Schema = mongoose.Schema
  , logger = require('../logging').logger
  , validator = require('validator')
  , ObjectId = mongoose.Schema.Types.ObjectId
  ;

var User = new Schema({
  _account: { type: ObjectId, ref: 'Account', required: true, index: true},
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, required: true, trim: true },
  address:  { type: String, required: true },
  avatar: String,
});

User.path('avatar').validate( function (url) {
  return validator.isURL( url, {
    protocols: ['http', 'https'],
    require_tld: true,
    require_protocol: true
  });
});

// TODO gotta rename this to email pronto!
// User.path('username').validate( validator.isEmail );

module.exports = mongoose.model('User', User);
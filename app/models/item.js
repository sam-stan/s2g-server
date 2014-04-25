'use strict';

var mongoose = require('mongoose')
  , Schema = mongoose.Schema
  , logger = require('../logging').logger
  , validator = require('validator')
  , ObjectId = mongoose.Schema.Types.ObjectId
  ;

var Item = new Schema({
  _owner: { type: ObjectId, ref: 'Account', required: true, index: true},
  _neighborhood: { type: ObjectId, ref: 'Neighborhood', required: true, index: true},
  name: { type: String, required: true, trim: true},
  description: { type: String },
  picture: String
});

Item.path('picture').validate( function (url) {
  return validator.isURL( url, {
    protocols: ['http', 'https'],
    require_tld: true,
    require_protocol: true
  });
});

module.exports = mongoose.model('Item', Item);
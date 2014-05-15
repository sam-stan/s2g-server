'use strict';

var mongoose = require('mongoose')
  , Schema = mongoose.Schema
  , logger = require('../logging').logger
  , Category = require('./category')
  ;

var Sample = new Schema({
  name: { type: String, required: true },
  categories: [ Category ],
  image: String, // Should this be a url?
  tags: [ String ]
});

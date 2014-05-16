'use strict';

var mongoose = require('mongoose')
  , Schema = mongoose.Schema
  , logger = require('../logging').logger
  ;

var Sample = new Schema({
  name: { type: String, required: true },
  categories: [ String ], // Store as a string until the need arises
  image: String, // Should this be a url?
  tags: [ String ]
});

mongoose.model('Sample', Sample);

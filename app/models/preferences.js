'use strict';

var mongoose = require('mongoose')
  , Schema = mongoose.Schema
  , logger = require('../logging').logger
  , Question = require('./question')
  ;

var Preferences = new Schema({
  categories: [ String ], // Store as a string until need arises?
  samples: [ Question ],
  lastUpdated: { type: Date, default: Date.now() }
});

mongoose.model('Preferences', Preferences);
module.exports = Preferences;

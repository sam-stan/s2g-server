'use strict';

var mongoose = require('mongoose')
  , Schema = mongoose.Schema
  , logger = require('../logging').logger
  , Category = require('./category')
  , Question = require('./question')
  ;

var Preferences = new Schema({
  categories: [ Category ], // Better to clone object than link object?
  samples: [ Question ],
  lastUpdated: { type: Date, default: Date.now() }
});

module.exports = Preferences;

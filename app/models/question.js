'use strict';

var mongoose = require('mongoose')
  , Schema = mongoose.Schema
  , logger = require('../logging').logger
  , ObjectId = mongoose.Schema.Types.ObjectId
  ;

var Question = new Schema({
  _sample: { type: ObjectId, ref: 'Sample', required: true },
  type: { type: String, required: true },
  dateAsked: Date,
  dateAnswered: Date,
  response: Boolean
});

module.exports = Question;

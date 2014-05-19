'use strict';

var mongoose = require('mongoose')
  , Schema = mongoose.Schema
  , logger = require('../logging').logger
  ;

var Preferences = new Schema({
  categories: [ String ], // Store as a string until need arises?
  questions: { type: Object, default: {} },
  lastUpdated: { type: Date, default: Date.now() }
});

mongoose.model('Preferences', Preferences);
module.exports = Preferences;

/*
  QUESTIONS OBJECT EXAMPLE
  Notes:
    1. The key for each question should be the 
    sample_id plus the type (i.e. lend or borrow)
    delimited by a colon.
    For example, a sample with _id: 'abc123' and 
    a question for lending would be -> 'abc123:lend'
  questions: {
    '123abc:lend': {
      _id: 'abc123:lend',
      _sample: {
        _id: 'abc123',
        name: 'Lawn mower',
        categories: [ 'tools'],
        image: 'http://flicker.com/myimage',
        tags: ['lawn', 'gas powered']
      },
      type: boolean,  
      dateAsked: some date,
      dateAnswered: some date, // left blank if new
      response: boolean // left blank if new
    },
    'abc123:borrow': {
  
    }
  }
*/

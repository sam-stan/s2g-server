'use strict';

var mongoose = require('mongoose')
  , Schema = mongoose.Schema
  , logger = require('../logging').logger
  , ObjectId = mongoose.Schema.Types.ObjectId
  ;

var Category = new Schema({
  name: { type: String, required: true },
  parents: [ { type: ObjectId, ref: 'Category' } ]// Or related?
});

mongoose.model('Category', Category);
module.exports = Category;

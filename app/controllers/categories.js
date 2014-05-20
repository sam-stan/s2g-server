'use strict';

var mongoose = require('mongoose')
  , Category = mongoose.model('Category')
  , utils = require('../utilities')
  , checkAccountError = utils.checkAccountError
  , checkError = utils.checkError
  ;

exports.get = function(req, res, next) {
  Category.find({}, function(err, data) {
    checkError(err, res, next);

    var categories = [];
    for(var i = 0; i < data.length; ++i) {
      categories.push(data[i].name);
    }

    res.send({
      status: 'success',
      data: categories
    });
  });
};

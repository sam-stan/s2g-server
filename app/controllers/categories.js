'use strict';

var mongoose = require('mongoose')
  , Category = mongoose.model('Category')
  , logger = require('../logging').logger
  ;

exports.get = function(req, res, next) {
  Category.find({}, function(err, data) {
    if(err) {
      res.send(500, { status: 'error', message: err });
      return next();
    }

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

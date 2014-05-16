"use strict";

var restify = require('restify')
  , categories = require('../controllers/categories' )
  ;

module.exports = function(server) {

  // Get item categories
  server.get({
      url: '/categories',
      swagger: {
        summary: 'Get the item categories',
        notes: 'Returns item categories',
        nickname: 'getCategories'        
      }
    },[  // middleware
      restify.bodyParser(),
    ], 
    function (req, res, next) {
      return categories.get(req, res, next);
    });

};

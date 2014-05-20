"use strict";

var restify = require('restify')
  , restifyValidation = require('node-restify-validation')
  , preferences = require('../../controllers/users/preferences')
  , logger = require('../../logging').logger
  ;

module.exports = function(server) {

  var plugins = [ restify.bodyParser(),
    restifyValidation.validationPlugin({errorsAsArray: false})
  ];

  // Get user preferences
  server.get({
    url: '/users/:email/preferences',
    swagger: {
      summary: 'Get the user\'s preferences',
      notes: 'Returns a 404 if the user doesn\'t exist',
      nickname: 'getPreferences'
    },
    validation: {
      email: { isRequired: true, isEmail: true, scope: 'path', description: 'Your email for login.'}     
    }
  },[
    restify.queryParser(),
    restifyValidation.validationPlugin({errorsAsArray: false})
  ],
  function (req, res, next) {
    if (!req.username || req.username !== req.params.email) {
      return res.sendUnauthenticated();
    }
    return preferences.getPreferences(req, res, next);
  }); 

  // Get user preferences categories
  server.get({
    url: '/users/:email/preferences/categories',
    swagger: {
      summary: 'Get the user\'s preferences categories',
      notes: 'Returns a 404 if the user doesn\'t exist',
      nickname: 'getPreferencesCategories'
    },
    validation: {
      email: { isRequired: true, isEmail: true, scope: 'path', description: 'Your email for login.'}     
    }
  },[
    restify.queryParser(),
    restifyValidation.validationPlugin({errorsAsArray: false})
  ],
  function (req, res, next) {
    if (!req.username || req.username !== req.params.email) {
      return res.sendUnauthenticated();
    }
    return preferences.getPreferencesCategories(req, res, next);
  });  

  // Get user preferences categories
  server.put({
    url: '/users/:email/preferences/categories',
    swagger: {
      summary: 'Update the user\'s preferences categories',
      notes: 'Returns a 404 if the user doesn\'t exist',
      nickname: 'putPreferencesCategories'
    },
    validation: {
      email: { isRequired: true, isEmail: true, scope: 'path', description: 'Your email for login.'}     
    }
  },[
    restify.queryParser(),
    restify.bodyParser(),
    restifyValidation.validationPlugin({errorsAsArray: false})
  ],
  function (req, res, next) {
    if (!req.username || req.username !== req.params.email) {
      return res.sendUnauthenticated();
    }
    return preferences.putPreferencesCategories(req, res, next);
  }); 

};

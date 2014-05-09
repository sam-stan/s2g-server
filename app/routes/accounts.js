"use strict";

var restify = require('restify')
  , restifyValidation = require('node-restify-validation')
  , accounts = require('../controllers/accounts' )
  ;

module.exports = function(server) {

  server.post({
      url: '/accounts',
      swagger: {
        summary: 'Create an account',
        notes: 'A unique email is expected. Passwords are hashed before being stored.',
        nickname: 'createAccount'        
      }, 
      validation: {
        email: { isRequired: true, isEmail: true, scope: 'query', description: 'Your email for login.'},
        password: { isRequired: true, scope: 'query', description: 'A new password for your account.'},
        neighborhood: { isRequired: true, scope: 'query', description: 'Neighborhood id of the user.'}
      }
    },[
      restify.queryParser(),
      restify.bodyParser(),     
      restifyValidation.validationPlugin({errorsAsArray: false}),
    ],
    accounts.create);

      // Get a user
  server.get({
      url: '/accounts/:username',
      swagger: {
        summary: 'Get the user profile',
        notes: 'Returns profile information',
        nickname: 'getUser'        
      },
      validation: {
        // email: { isRequired: true, isEmail: true, scope: 'query', description: 'Your email for login.'},
        // password: { isRequired: true, scope: 'query', description: 'A new password for your account.'}
      }
    },[  // middleware
      restify.bodyParser(),
      restifyValidation.validationPlugin({errorsAsArray: false})
    ], 
    function (req, res, next) {
      if (!req.username) {
        return res.sendUnauthenticated();
      }
      return accounts.get(req, res, next);
    });

  // Save a user
  server.put({
      url: '/accounts/:username',
      swagger: {
        summary: 'Add or update a User',
        notes: '',
        nickname: 'updateUser'              
      },
      validation: {}
    },[ // middleware
      restify.queryParser(),
      restify.bodyParser(),
      restifyValidation.validationPlugin({errorsAsArray: false})
    ],
    function (req, res, next) {
      if (!req.username || req.username !== req.params.username) {
        return res.sendUnauthenticated();
      }
      return accounts.put(req, res, next);
    });
};

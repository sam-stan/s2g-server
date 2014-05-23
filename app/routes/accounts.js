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
    
// update fb
  server.put({
    url: '/accounts',
    swagger: {
      summary: 'Update User\'s FacebookId',
      notes: 'The user must have been created first using a post and check if it exist',
      nickname: 'updateUserFacebookId'
    },
    validation: {                
      username: { isRequired: true, scope: 'query', description: 'Username is needed in order to update'},
      facebookId: { isRequired: true, scope: 'query', description: 'facebookId is needed in order to update'}
    }
  },[ // middleware
    restify.queryParser(),
    restify.bodyParser(),
    restifyValidation.validationPlugin({errorsAsArray: false})
  ],
  accounts.update); 

// check if fb exist
  server.get({
    url: '/accounts',
    swagger: {
      summary: 'Check If User\'s FacebookId Exist',
      notes: 'The user must have been created first using a post',
      nickname: 'checkUserFacebookId'
    },
    validation: {                
      facebookId: { isRequired: true, scope: 'query', description: 'facebookId is needed in order to verify'}
    }
  },[ // middleware
    restify.queryParser(),
    restify.bodyParser(),
    restifyValidation.validationPlugin({errorsAsArray: false})
  ],
  accounts.getFbId); 
};

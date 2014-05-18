"use strict";

var restify = require('restify')
  , restifyValidation = require('node-restify-validation')
  , questions = require('../../controllers/users/questions')
  , logger = require('../../logging').logger
  ;

module.exports = function(server) {

  var plugins = [ restify.bodyParser(),
    restifyValidation.validationPlugin({errorsAsArray: false})
  ];

  // Get all questions
  server.get({
    url: '/users/:email/questions',
    swagger: {
      summary: 'Get all questions for a user',
      notes: 'Returns a 200 with an empty array if there are no questions',
      nickname: 'getUserQuestions'
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
    return questions.getQuestions(req, res, next);
  });

  // Get 1 question
  server.get({
    url: '/users/:email/questions/:id',
    swagger: {
      summary: 'Get a specific question for the user',
      notes: 'Returns a 404 if the question or user doesn\'t exist',
      nickname: 'getUserQuestion'
    },
    validation: {
      email: { isRequired: true, isEmail: true, scope: 'path', description: 'Your email for login.'},
      id: { isRequired: true, scope: 'path', regex: /^[0-9a-f]{1,24}$/, description: '24 digit hex unique identifier.'},      
    }
  },[
    restify.queryParser(),
    restifyValidation.validationPlugin({errorsAsArray: false})
  ],
  function (req, res, next) {
    if (!req.username || req.username !== req.params.email) {
      return res.sendUnauthenticated();
    }
    return questions.getQuestion(req, res, next);
  }); 

  // Update 1 question
  server.put({
    url: '/users/:email/questions/:id',
    swagger: {
      summary: 'Update a specific question for the user',
      notes: 'Returns a 404 if the question or user doesn\'t exist',
      nickname: 'getUserQuestion'
    },
    validation: {
      email: { isRequired: true, isEmail: true, scope: 'path', description: 'Your email for login.'},
      id: { isRequired: true, scope: 'path', regex: /^[0-9a-f]{1,24}$/, description: '24 digit hex unique identifier.'},      
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
    return questions.putQuestion(req, res, next);
  });  

};

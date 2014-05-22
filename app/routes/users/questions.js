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
    url: '/users/:email/preferences/questions',
    swagger: {
      summary: 'Get all questions for a user',
      notes: 'Returns a 200 with an empty array if there are no questions',
      nickname: 'getQuestions'
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

  // Delete all questions
  server.del({
    url: '/users/:email/preferences/questions',
    swagger: {
      summary: 'Delete all questions for a user',
      notes: 'Returns a 404 if user\'s preferences object does not exist',
      nickname: 'deleteQuestions'
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
    return questions.deleteQuestions(req, res, next);
  });

  // Get 10 new questions
  server.get({
    url: '/users/:email/preferences/questions/new',
    swagger: {
      summary: 'Get 10 new questions for a user',
      notes: 'Returns a 200 with an empty array if there are no new questions',
      nickname: 'getNewQuestions'
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
    return questions.getNewQuestions(req, res, next);
  });

  // Get 1 question
  server.get({
    url: '/users/:email/preferences/questions/:id',
    swagger: {
      summary: 'Get a specific question for the user',
      notes: 'Returns a 404 if the question or user doesn\'t exist',
      nickname: 'getUserQuestion'
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
    return questions.getQuestion(req, res, next);
  }); 

  // Update 1 question
  server.put({
    url: '/users/:email/preferences/questions/:id',
    swagger: {
      summary: 'Update a specific question for the user',
      notes: 'Returns a 404 if the question or user doesn\'t exist',
      nickname: 'getUserQuestion'
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
    return questions.putQuestion(req, res, next);
  });  

};

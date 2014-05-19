'use strict';

var mongoose = require('mongoose')
  , Question = mongoose.model('Question')
  , Account = mongoose.model('Account')
  , Preferences = mongoose.model('Preferences')
  , logger = require('../../logging').logger
  , checkAccountError = require('../../utilities').checkAccountError
  ;

exports.getQuestions = function (req, res, next) {
  Account
    .find({ email: req.params.email })
    .populate('preferences')
    .exec(function(err, data) {
      checkAccountError(err, data, req.params.email, res, next);

      if(!data[0].preferences) {
        logger.error('preferences for %s not found', req.params.email);
        res.send(404, {
          status: 'error',
          message: 'user preferences ' + req.params.email + ' not found'
        });
        return next();
      }

      var questions = [],
          questionsObj = data[0].preferences.questions;
      for(var key in questionsObj) {
        questions.push(questionsObj[key]);
      }

      res.send({
        status: 'success',
        data: questions
      });
      return next();
    });
};


exports.getQuestion = function (req, res, next) {
  // logger.debug('#users.getQuestion');
  Account
    .find({ email: req.params.email })
    .populate('preferences')
    .exec(function(err, data) {
      checkAccountError(err, data, req.params.email, res, next);

      if(!data[0].preferences) {
        logger.error('preferences for %s not found', req.params.email);
        res.send(404, {
          status: 'error',
          message: 'user preferences ' + req.params.email + ' not found'
        });
        return next();
      }

      // Check to see if the user already received the question
      var question = data[0].preferences.questions[req.params.id];
      if(question) {
        res.send({
          status: 'success',
          data: question
        });
        return next();
      }
      
      logger.error('question %s not found', req.params.id);
      res.send(404, {
        status: 'error',
        message: 'question ' + req.params.id + ' not found'
      });
      return next();
    });
};

exports.putQuestion = function (req, res, next) {
  // logger.debug('#users.putQuestion');
  Account
    .find({ email: req.params.email })
    .populate('preferences')
    .exec(function(err, data) {
      checkAccountError(err, data, req.params.email, res, next);

      if(!data[0].preferences) {
        logger.error('preferences for %s not found', req.params.email);
        res.send(404, {
          status: 'error',
          message: 'user preferences ' + req.params.email + ' not found'
        });
        return next();
      }

      var preferences = data[0].preferences;
      // Check to see if the user already received the question
      var question = preferences.questions[req.params.id];
      if(question) {
        question.response = req.params.response;
        question.dateAnswered = new Date();
      
        Preferences.update({ _id: preferences._id },
          { questions: preferences.questions, 
            lastUpdated: new Date()
          }, function(err, numUpdated) {
            if (err) {
              logger.error(err);
              res.send(500, {
                status: 'error',
                message: err
              });
              return next();
            }

            if(numUpdated !== 1) {
              logger.error('Preferences document not successfully updated.');
              res.send(500, {
                status: 'error',
                message: 'Preferences document not successfully updated.'
              });
              return next();
            }

            res.send(201);
          });
      } else {
        logger.error('question for %s not found', req.params.email);
        res.send(404, {
          status: 'error',
          message: 'user question ' + req.params.email + ' not found'
        });
        return next();
      }
    });
};

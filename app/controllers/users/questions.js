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
        res.send(400, {
          status: 'error',
          message: 'user preferences ' + req.params.email + ' not found'
        });
        return next();
      }

      res.send({
        status: 'success',
        data: data[0].preferences.samples
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
        res.send(400, {
          status: 'error',
          message: 'user preferences ' + req.params.email + ' not found'
        });
        return next();
      }

      // Check to see if the user already received the question
      data[0].preferences.samples.forEach(function(question) {
        if(question._id == req.params.id) {
          res.send({
            status: 'success',
            data: question
          });
          return next();
        }
      });
      
      logger.error('question for %s not found', req.params.email);
      res.send(400, {
        status: 'error',
        message: 'user question ' + req.params.email + ' not found'
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
        res.send(400, {
          status: 'error',
          message: 'user preferences ' + req.params.email + ' not found'
        });
        return next();
      }

      var preferences = data[0].preferences;
      var match = false;
      // Check to see if the user already received the question
      preferences.samples.forEach(function(question, index) {
        if(question._id == req.params.id) {
          match = true;
          question.response = req.params.response;
          question.dateAnswered = new Date();
          preferences.samples[index] = question;
          var update = {
            categories: preferences.categories,
            samples: preferences.samples,
            lastUpdated: new Date()
          };

          Preferences.update({ _id: preferences._id }, 
            update, function(err, numUpdated) {
              if (err) {
                logger.error(err);
                res.send(500, {
                  status: 'error',
                  message: err
                });
                return next();
              }

              res.send(201);
              return next();
            });
        }
      });
      
      if(!match) {
        logger.error('question for %s not found', req.params.email);
        res.send(400, {
          status: 'error',
          message: 'user question ' + req.params.email + ' not found'
        });
        return next();
      }
    });
};

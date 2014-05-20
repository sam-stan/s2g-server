'use strict';

var mongoose = require('mongoose')
  , Account = mongoose.model('Account')
  , Preferences = mongoose.model('Preferences')
  , Sample = mongoose.model('Sample')
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

exports.getNewQuestions = function (req, res, next) {
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

      var newQuestions = [],
          questionsObj = data[0].preferences.questions,
          preferences_id = data[0].preferences._id;

      (function createNewQuestions(count) {
        Sample.find({}).skip(count).limit(20).exec(function(err, data) {
          if (err) {
            logger.error(err);
            res.send(500, {
              status: 'error',
              message: err
            });
            return next();
          }

          // Go through returned samples and look for available
          // questions, alternating between 'lend' and 'borrow'
          // for each sample returned
          var id, question_id, question, type;
          for(var i = 0; i < data.length && newQuestions.length === 10; ++i) {
            // Track if question is available for sample
            question_id = null;
            id = data[i]._id;
            if(i % 2) {
              if(!questionsObj[id + '-lend']) {
                type: 'lend';
                question_id = id + '-lend';
              } else if (!questionsObj[id + '-borrow']) {
                type: 'borrow';
                question_id = id + '-borrow';
              }
            } else {
              if(!questionsObj[id + '-borrow']) {
                type: 'borrow';
                question_id = id + '-borrow';
              } else if (!questionsObj[id + '-lend']) {
                type: 'lend';
                question_id = id + '-lend';
              }
            }

            // If a match is found, push it to the newQuestions array
            if(question_id) {
              question = {
                _id: question_id,
                _sample: data[i],
                type: type,
                dateAsked: new Date()
              };
              // Add to user preferences object
              questionsObj[question_id] = question;
              // Push question newQuestions, which is sent
              // to the client
              newQuestions.push(question);
            }
          }

          if(newQuestions.length >= 10 || data.length < 10) {
            console.log('\n\n\nFound enough\n\n\n');
            // Update the preferences for the given account
            Preferences.update({ _id: preferences_id }, 
              { questions: questionsObj }, function(err, numAffected) {
                if (err) {
                  logger.error(err);
                  res.send(500, {
                    status: 'error',
                    message: err
                  });
                  return next();
                }

                if(numAffected !== 1) {
                  logger.error('Preferences document not successfully updated.');
                  res.send(500, {
                    status: 'error',
                    message: 'Preferences document not successfully updated.'
                  });
                  return next();
                }

                res.send(200, {
                  status: 'success',
                  data: newQuestions
                });
                return next();
              });
          } else {
            console.log('\n\n\nlooking for more\n\n\n');
            // Get 20 more samples to find new questions
            createNewQuestions(count + 20);
          }
        });
      })(0);
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

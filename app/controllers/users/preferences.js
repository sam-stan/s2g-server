var mongoose = require('mongoose')
  , Preferences = mongoose.model('Preferences')
  , Account = mongoose.model('Account')
  , logger = require('../../logging').logger
  , checkAccountError = require('../../utilities').checkAccountError
  ;

exports.getPreferences = function(req, res, next) {

  Account.find( {email: req.params.email} ).exec( function (err, data) {
    checkAccountError(err, data, req.params.email, res, next);

    if(data[0].preferences) {
      Preferences.find({ _id: data[0].preferences }).exec(function(err, data2) {
        if (err) {
          logger.error(err);
          res.send(500, {
            status: 'error',
            message: err
          });
          return next();
        }

        if ( data2.length !== 1) {
          logger.error('Preferences for %s not found', req.params.email);
          res.send(400, {
            status: 'error',
            message: 'user preferences for ' + req.params.email + ' not found'
          });
          return next();
        }

        var questions = [];
        for(var key in data2[0].questions) {
          questions.push(data2[0].questions[key]);
        }

        var preferences = {
          categories: data2[0].categories,
          questions: questions,
          lastUpdated: data2[0].lastUpdated
        };

        res.send({
          status: 'success',
          data: preferences
        });
      });
    } else {
      var preferences = new Preferences();
      preferences.save(function(err, prefs) {
        if (err) {
          logger.error(err);
          res.send(500, {
            status: 'error',
            message: err
          });
          return next();
        }

        Account.update({ email: req.params.email }, { preferences: prefs._id }, function(err) {
          if (err) {
            logger.error(err);
            res.send(500, {
              status: 'error',
              message: err
            });
            preferences.remove();
            return next();
          }

          res.send({
            status: 'success',
            data: {
              categories: prefs.categories,
              questions: [],
              lastUpdated: prefs.lastUpdated
            }
          });
        });
      });
    }

    next();
  });
};

exports.putPreferencesCategories = function(req, res, next) {

  Account
    .find({ email: req.params.email })
    .exec(function(err, data) {
      checkAccountError(err, data, req.params.email, res, next);

      var query;
      if(data[0].preferences) {
        query = { _id: data[0].preferences };
      } else {
        query = {};
      }

      Preferences.update(query, { categories: req.params.categories }, 
        { upsert: true}, function(err) {
          if (err) {
            logger.error(err);
            res.send(500, {
              status: 'error',
              message: err
            });
            return next();
          }
          // If preferences were upserted, update the account
          if(!data[0].preferences) {
            Account.update({ email: req.params.email }, { preferences: prefs._id }, function(err) {
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
          } else {
            res.send(201);
            return next();
          }
        });
    });
};

exports.getPreferencesCategories = function(req, res, next) {

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
        data: data[0].preferences.categories
      });
      return next();
    });
};

var mongoose = require('mongoose')
  , Preferences = mongoose.model('Preferences')
  , Account = mongoose.model('Account')
  , logger = require('../../logging').logger
  , utils = require('../../utilities')
  , checkAccountError = utils.checkAccountError
  , checkError = utils.checkError
  ;

exports.getPreferences = function(req, res, next) {

  Account
    .find( {email: req.params.email} )
    .populate('preferences')
    .exec( function (err, data) {
      checkAccountError(err, data, req.params.email, res, next);
      console.log('\n\n\n' + JSON.stringify(preferences) + '\n\n\n');
      if(data[0].preferences) {
        preferences = data[0].preferences;

        var questions = [];
        for(var key in preferences.questions) {
          questions.push(preferences.questions[key]);
        }
        preferences.questions = questions;

        res.send({
          status: 'success',
          data: preferences
        });
      } else {
        var preferences = new Preferences();
        preferences.save(function(err, prefs) {
          checkError(err, res, next);

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
                _id: prefs._id,
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
      if ( data[0].preferences) {
        Preferences.update({ _id: data[0].preferences }, { categories: req.params.categories }, 
          function (err, numAffected) {
            checkError(err, res, next);

            if (numAffected !== 1) {
              logger.error('Preferences document not successfully updated.');
              res.send(500, {
                status: 'error',
                message: 'Preferences document not successfully updated.'
              });
              return next();
            }
            
            res.send(201);
            return next();
          });
      } else {
        var preferences = new Preferences({ categories: req.params.categories });
        preferences.save(function (err, PrefData) {
          checkError(err, res, next);

          Account.update({ _id: data[0]._id }, { preferences: PrefData._id }, function (err, numAffected) {
            checkError(err, res, next);
            if (numAffected !== 1) {
              logger.error('Preferences document not successfully updated.');
              res.send(500, {
                status: 'error',
                message: 'Preferences document not successfully updated.'
              });
              preferences.remove();
              return next();
            }

            res.send(201);
            return next();
          });
        });
      }
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
        res.send(404, {
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

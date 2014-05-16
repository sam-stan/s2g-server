'use strict';

var mongoose = require('mongoose')
  , Question = mongoose.model('Question')
  , Account = mongoose.model('Account')
  , logger = require('../../logging').logger
  ;
/*
// create a 24 character hex string
function pad24 (id) {
  return String('000000000000000000000000' + id ).slice(-24);
}

exports.putItem = function (req, res, next) {
  logger.debug('#users.putItem');

  // lookup the user to get the neighborhood and the account id.
  Account.find( {email: req.params.email} ).exec( function (err,d) {
    if (err) {
      logger.error(err);
      res.send(500, {
        status: 'error',
        message: err
      });
      return next();
    }

    if ( d.length !== 1) {
      logger.error('user %s not found', req.params.email);
      res.send(400, {
        status: 'error',
        message: 'user ' + req.params.email + ' not found'
      });
      return next();
    }

    var item = new Item({
      name: req.params.name,
      description: req.params.description,
      picture: req.params.picture,
      _neighborhood: d[0]._neighborhood,
      _owner: d[0]._id
    });

    // Remove the _id property from the json object
    // because it cannot be used with an upsert.
    var update = item.toObject()
      , id = pad24(req.params.id);
    delete update._id;

    // In this case here, the update is searching
    // on the supplied id, so id will be used to
    // create the object _id if this turns out to be
    // a save instead of an update.
    Item.update( {_id: id}, update, {upsert: true}, function (err) {
      if (err) {
        logger.error('Failed to save the item %s for user %s: %s', item.id, item.email, err);
        res.send(500, {
          status: 'error',
          message: err
        });
        return next();
      }
      res.send(201);
      return next();
    });
  });
};

exports.getItems = function (req, res, next) {
  Account.find( {email: req.params.email} ).exec( function (err, d) {
    if (err) {
      logger.error(err);
      res.send(500, {status: 'error', message: err} );
      return next();
    }

    Item.find( {_owner: d[0]._id} ).exec( function (err,d) {
      console.log('item query finished');
      if (err) {
        console.log(err);
        res.send(500, { status: 'error', message: err } );
        return next();
      }
      console.info('found items');
      console.log(d);
      res.send({
        status: 'success',
        data: d
      });
      next();
    });

  });
};
*/

exports.getQuestion = function (req, res, next) {
  // logger.debug('#users.getQuestion');
  Account.find( { email: req.params.email } ).exec( function(err, data) {
    // Possibly turn these checks into a utility function?
    if (err) {
      logger.error(err);
      res.send(500, {
        status: 'error',
        message: err
      });
      return next();
    }

    if ( d.length !== 1) {
      logger.error('user %s not found', req.params.email);
      res.send(400, {
        status: 'error',
        message: 'user ' + req.params.email + ' not found'
      });
      return next();
    }

    var question;

    // Check to see if the user already received the question
    data[0].preferences.samples.forEach(function(question) {
      if(question._id === req.params.id) {
        res.send({
          status: 'success',
          data: question
        });
        next();
      }
    });

    // If user does not have the question, see if it exists
    // Should we allow users to request a question they don't have
    // in their preferences?
    Question.find( { _id: req.params.id } ).exec( function(err, data) {
      if (err) {
        logger.error(err);
        res.send(500, {
          status: 'error',
          message: err
        });
        return next();
      }

      if ( d.length !== 1) {
        logger.error('question %s not found', req.params.id);
        res.send(400, {
          status: 'error',
          message: 'question ' + req.params.id + ' not found'
        });
        return next();
      }

      res.send({
        status: 'success',
        data: data[0]
      });
    });
  });
};

'use strict';

var mongoose = require('mongoose')
  , Item = mongoose.model('Item')
  , Account = mongoose.model('Account')
  , logger = require('../../logging').logger
  , utils = require('../../utilities')
  , checkAccountError = utils.checkAccountError
  , checkError = utils.checkError
  ;

// create a 24 character hex string
function pad24 (id) {
  return String('000000000000000000000000' + id ).slice(-24);
}

exports.putItem = function (req, res, next) {
  logger.debug('#users.putItem');

  // lookup the user to get the neighborhood and the account id.
  Account.find( {email: req.params.email} ).exec( function (err,d) {
    checkAccountError(err, d, req.params.email, res, next);

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
    checkAccountError(err, d, req.params.email, res, next);

    Item.find( {_owner: d[0]._id} ).exec( function (err,d) {
      checkError(err, res, next);
      
      res.send({
        status: 'success',
        data: d
      });
      next();
    });

  });
};

exports.getItem = function (req, res, next) {
  // logger.debug('#users.getItems');
  Item
  .find( {_id: req.params.id})
  .populate('_owner', 'email')
  .exec( function (err, d) {
    checkError(err, res, next);

    if ( d.length === 1 && d[0]._owner.email !== req.params.email) {
      res.send(404);
      return next();
    }
    res.send({
      status: 'success',
      data: d
    });
    next();
  });
};


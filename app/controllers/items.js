'use strict';

var mongoose = require('mongoose')
  , Item = mongoose.model('Item')
  , logger = require('../logging').logger
  ;

exports.put = function (req,res,next) {
  logger.debug('#items.put');
  var item = new Item({
    name: req.params.name,
    description: req.params.description,
    picture: req.params.picture,
    _id: req.params.id,
    _neighborhood: req.params.neighborhoodId,
    _owner: req.params.userId
  });

  // Remove the _id property from the json object
  // because it cannot be used with an upsert.
  var update = item.toObject();
  delete update._id;
  
  Item.update( {email: req.params.username}, update, {upsert: true},
    function (err) {
    if (err) {
      logger.error('Failed to save item %s for user %s: %s', req.params.name, req.params.username, err);
      res.send(500,{
        status: 'error',
        message: err
      });
      return next();
    }
    res.send(201);
    return next();
  });
};
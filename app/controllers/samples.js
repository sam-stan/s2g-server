'use strict';

var mongoose = require('mongoose')
  , Sample = mongoose.model('Sample')
  , logger = require('../logging').logger
  ;

exports.get = function (req, res, next) {
  Sample.find().exec(function (err, d) {
    var reply = {}; 
    if (err) {
      reply.status = 'error';
      reply.message = err;
      res.send(500, reply);
      return next();
    }    
    reply = {
      status: 'success',
      data: []
    };
    for (var i=0; i<d.length; ++i) {
      reply.data.push({
        id: d[i]._id,
        type: d[i].type,
        name: d[i].name,
        image: d[i].image,
        tags: d[i].tags,
        categories: d[i].categories
      });
    }

    res.send(reply);
    next();
  });
};

exports.getOne = function (req, res, next) {
  Sample.find({_id: req.params.id}).exec(function (err, d) {
    var reply = {};
    if (err) {
      reply.status = 'error';
      reply.message = err;
      res.send(500, reply);
      return next();
    }
    if (d.length === 0) {
      res.send(404);
      return next();
    }
    reply = {
      status: 'success',
      data: {
        id: d[0]._id,
        type: d[0].type,
        name: d[0].name,
        image: d[0].image,
        tags: d[0].tags,
        categories: d[0].categories        
      }
    };    
    res.send(reply);
    next();
  });
};

exports.create = function (req, res, next) {
  var sample = new Sample({
    name: req.params.name,
    type: req.params.type,
    image: req.params.image,
    categories: req.params.categories,
    tags: req.params.tags
  });
  sample.save( function (err) {
    if (err) {
      res.send(500, {
        status: 'error',
        message: err
      });
      return next();
    }
    res.send(201, {
      status: 'success',
      data: {
        id: sample._id,
        type: req.params.type,
        name: req.params.name,
        image: req.params.image,
        categories: req.params.categories,
        tags: req.params.tags
      }
    });
    return next();
  });
};

exports.put = function (req, res, next) {
  var sample = new Sample({
    _id: req.params.id,
    type: req.params.type,
    name: req.params.name,
    description: req.params.description,
    image: req.params.image,
    categories: req.params.categories,
    tags: req.params.tags
  });
  var update = sample.toObject();
  delete update._id;

  Sample.update({_id: req.params.id}, update, {upsert: true},function (err) {
    if (err) {
      logger.error('Failed to save sample %s: %s', req.params.id, req.params.name);
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

exports.removeOne = function (req, res, next) {
  Sample.find({_id: req.params.id}).exec(function (err, d) {
    var reply = {};
    if (err) {
      reply.status = 'error';
      reply.message = err;
      res.send(500, reply);
      return next();
    }
    for (var i=0; i<d.length; ++i) {
      d[i].remove();
    } 
    res.send(204);
    next();
  });
};

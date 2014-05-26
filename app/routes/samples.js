'use strict';

var restify = require('restify')
  , restifyValidation = require('node-restify-validation')
   , samples = require('../controllers/samples.js' )
  ;

module.exports = function(server) {

  // Get the samples
  server.get({
      url: '/samples',
      swagger: {
        summary: 'Get all the samples',
        notes: 'Returns an empty array if there are no samples.',
        nickname: 'getSamples'        
      },
      validation: {
      }
    },[  // middleware
      restify.queryParser(),
      restify.bodyParser(),
      restifyValidation.validationPlugin({errorsAsArray: false})
    ], 
    function (req, res, next) {
      if (!req.username) {
        return res.sendUnauthenticated();
      }
      return samples.get(req, res, next);
    });

  // Get the samples
  server.get({
      url: '/samples/:id',
      swagger: {
        summary: 'Get a sample by id/',
        notes: '404 when no such sample.',
        nickname: 'getSample'        
      },
      validation: {
      }
    },[  // middleware
      restify.queryParser(),
      restify.bodyParser(),
      restifyValidation.validationPlugin({errorsAsArray: false})
    ], 
    function (req, res, next) {
      if (!req.username) {
        return res.sendUnauthenticated();
      }
      return samples.getOne(req, res, next);
    }
  );

  server.post({
    url: '/samples',
    swagger: {
      summary: 'Add a category to the service',
      notes: 'Returns the posted category',
      nickname: 'postSample'
    },
    validation: {
      name: { isRequired: true, scope: 'query', description: 'Name of the Sample.'},
      type: { isRequired: true, scope: 'query', description: 'One of "item" or "service".'},
      image: { isRequired: true, scope: 'query', description: 'Image of the Sample.'},
      categories: { isRequired: true, scope: 'query', description: 'Array of categories to which this item belongs'},
      tags: { isRequired: false, scope: 'query', description: 'Array of tags.'}
    }
  },[ //middleware
    restify.bodyParser(),
    restifyValidation.validationPlugin({errorsAsArray: false})
  ],
  function (req, res, next) {
    if (!req.username) {
      return res.sendUnauthenticated();
    }
    return samples.create(req, res, next);
  });

  server.put({
    url: '/samples/:id',
    swagger: {
      summary: 'Add or update a specific category',
      notes: 'Returns a 204',
      nickname: 'putSample'
    },
    validation: {
      name: { isRequired: true, scope: 'query', description: 'Name of the Sample.'},
      type: { isRequired: true, scope: 'query', description: 'One of "item" or "service".'},
      image: { isRequired: true, scope: 'query', description: 'Image of the Sample.'},
      categories: { isRequired: true, scope: 'query', description: 'Array of categories to which this item belongs'},
      tags: { isRequired: false, scope: 'query', description: 'Array of tags.'},
      id: { isRequired: false, scope: 'query', description: 'Id of the item. Must match that of the id in the uri if present.'}
    }
  },[ //middleware
    restify.bodyParser(),
    restifyValidation.validationPlugin({errorsAsArray: false})
  ],
  function (req, res, next) {
    if (!req.username) {
      return res.sendUnauthenticated();
    }
    return samples.put(req, res, next);
  });  

  // Delete a sample
  server.del({
      url: '/samples/:id',
      swagger: {
        summary: 'Delete a sample by id/',
        notes: '404 when no such sample, 204 when deleted',
        nickname: 'deleteSample'        
      },
      validation: {
      }
    },[  // middleware
      restify.queryParser(),
      restify.bodyParser(),
      restifyValidation.validationPlugin({errorsAsArray: false})
    ], 
    function (req, res, next) {
      if (!req.username) {
        return res.sendUnauthenticated();
      }
      return samples.removeOne(req, res, next);
    }
  );

};
/*global module:true, require:true, console:true, process:true */

'use strict';

var path = require('path')
  , restify = require('restify')
  , mongoose = require('mongoose')
  , conf = require('./config')
  , restify = require('restify')
  , restifySwagger = require('node-restify-swagger')
  , restifyValidation = require('node-restify-validation')
  , restifyOAuth2 = require('restify-oauth2')
  , logger = require('./logging').logger
  ;

exports.createServer = createServer;

/*
 * Set up server
 * @return the created server
 */
function createServer () {

  var config = {
    name: require('../package').name,
    log: logger
  };

  // INIT MONGO
  mongoose.connect(conf.get('mongo.db'));
  mongoose.connection.on('error', function(err) {
    logger.error('Mongoose connection error: %s', err);
  });
  mongoose.connection.on('open;', function(err) {
    logger.info('Mongoose connection opened.');
  });

  // LOAD MODELS
  require( './models/account.js');
  require( './models/neighborhood.js');
  require( './models/oauth2token.js');
  
  var server = restify.createServer(config);
  // Global plugins.  Set the plugin on a per route basis.
  server.use(restify.acceptParser(server.acceptable));
  server.use(restify.queryParser());
  server.use(restify.authorizationParser());

  // Init Oauth2 
  var oauth2 = require('./controllers/oauth2');
  restifyOAuth2.ropc(server, { tokenEndpoint: '/token', hooks: oauth2, plugins: [restify.bodyParser({ mapParams: false })] }); 

  restifySwagger.configure(server, {
    info: {
      contact: 'seb@share2give.com',
      description: 'This page allows you to learn about the API and issue sample requests.',
      license: 'Copyright 2014 - Share2Give, all rights reserved.',
      // licenseUrl: 'http://opensource.org/licenses/MIT',
      // termsOfServiceUrl: 'http://opensource.org/licenses/MIT',
      title: 'Welcome to the developer API console.'
    },
    apiDescriptions: {
      'get':'GET-Api Resource',
      'post':'POST-Api Resource'
    }
  });

  server.on('NotFound', function (req, res, next) {
    if (logger) logger.debug('404', 'Request for ' + req.url + ' not found. No route.');
    res.send(404, req.url + ' was not found');
  });
  
  if (logger) {
    server.on('after', restify.auditLogger({ log: logger }));
  }

  // DEFINE ROUTES
  require( './routes/version.js' )(server);
  require( './routes/neighborhoods.js' )(server);
  require( './routes/register_user.js' )(server);
  require( './routes/accounts.js' )(server);
  require( './routes/user.js' )(server);
  
  // USAGE EXAMPLE: /test
  server.get('/test', function (req, res, next) {
    res.send({'result': 'test'});      
    return next();
  });

  // Documentation routes from Swagger
  restifySwagger.loadRestifyRoutes();

  
  // Serve static swagger resources
  server.get(/^\/docs\/?.*/, restify.serveStatic({directory: './swagger-ui'}));
  server.get('/', function (req, res, next) {
      res.header('Location', '/docs/index.html');
      res.send(302);
      return next(false);
    }); 
  
  return server;
}

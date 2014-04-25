'use strict';

var chai = require('chai')
  , should = chai.should()
  , request = require('supertest') 
  , logger = require('../../app/logging.js').logger
  , server = require('../../app/server')
  ;


exports.createInProcessApplication = function (url, done) {
  logger.info('Starting application at: %s', url);
  
  var app = server();
  app.run();

  server.on('ready', function () {
    exports.wakeUp(url, done, 0);
  });

  return app;
};

exports.wakeUp = function (url, done, timeout) {
  setTimeout(function() {
    request(url)
      .get('/expecting_a_404')
      .expect(404)
      .end(function(err, res) {
        if (err) {
          logger.error('Failed to start application: %s', err);
          if (err.code === 'ECONNREFUSED') {
            return done(new Error('Server is not running.'));
          }
          return done(err);
        }
        logger.info('%s is up', url);
        return done();
      });
  }, timeout);
};

exports.apiClient = {user: 'testClient', key: 'ZOMGdisDaBOMB'};

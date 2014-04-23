'use strict';

var mongoose = require('mongoose')
  , conf = require('../../app/config')
  , logger = require('../../app/logging').logger
  , utils = require('./utils')
  , events = require('events')
  , eventEmitter = new events.EventEmitter()
  ;

var url
  , app
  ;

var serverReady = false;
var done = function(taskName) {
  serverReady = true;
  eventEmitter.emit('serverReady');
  console.log('done %s', taskName );
};

var readyCallback;
eventEmitter.on('serverReady', function () {
  if (readyCallback) {
    readyCallback();
    readyCallback = null;
  }
});

// Set 'url' and start app if no testing endpoint provided.
// When starting a remote server, the e2e tests
// also connect to the mongo db so that they may clean up
// properly.
if ( process.env.TEST_URL ) {

  // INIT MONGO
  mongoose.connect(conf.get('mongo.db'));
  mongoose.connection.on('error', function(err) {
    logger.error('Mongoose connection error: %s', err);
  });
  mongoose.connection.on('open', function(err) {
    logger.info('Mongoose connection opened.');
  });

  url = process.env.TEST_URL;
  // let's increase the timeout of this setup
  // to account for possible spin-up cost on the 
  // hosting platform.
  var timeout = 10000;
  // this.timeout(timeout);
  // 0 timeout, we want to wake-it up now.
  logger.info('Waking up end-point (%dms): %s', timeout, url);
  utils.wakeUp(url, done.bind(null, 'waking up '+url), 0);
} else if ( conf.get('server.cluster') ) {
  logger.fatal('Configuration for server.cluster must be "false" for local integration tests');
  logger.info('Try CLUSTER=false as environment variable');
  // clustered configurations are not supported
  // in local server mode.
  // expect(conf.get('server.cluster')).to.be.false;
} else {
  // this.timeout(10000);
  var port = conf.get('server.port');
  url = 'http://localhost:' + port;
  app = utils.createInProcessApplication(url, done.bind(null, 'waking up '+url));
}
logger.info( 'MongoDb: %s', conf.get('mongo.db'));


exports.app = app;
exports.url = url;
exports.ready = function (done) {
  if (serverReady) {
    done();
  } else {
    readyCallback = done;
  }
};

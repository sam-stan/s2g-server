'use strict';

var server = require('../../lib/server.js')
  , url = server.url
  , request = require('supertest')
  , chai = require('chai')
  , expect = chai.expect
  , logger = require('../../../app/logging').logger
  , mongoose = require('mongoose')
  , accountFactory = require('../../lib/accountFactory.js')
  ;

describe( 'INTEGRATION #/requests', function() {
});

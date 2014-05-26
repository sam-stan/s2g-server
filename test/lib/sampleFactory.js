'use strict';

var q = require('q')
  , request = require('supertest')
  , logger = require('../../app/logging').logger
  ;

require('../../app/models/sample');
var mongoose = require('mongoose');
var Sample = mongoose.model('Sample');

function Samples() {
  this.samples = [];
  this.removeAll = function (done) {
    var ids = [];
    for (var i = 0; i < this.samples.length; ++i) {
      ids.push( this.samples[i].id );
    }
    var d = q.defer();
    Sample.remove( {_id: { '$in':ids}}, function (err) {
      if (err) {
        logger.warn( 'Failed to remove the test samples');
        d.reject(err);
      } else {
        d.resolve();
      }
    });
    return d.promise;
  };
}

exports.createOne = function (url, oauth2Token) {
  var d = q.defer();

  var samples = new Samples();

  request(url)
  .post('/samples')
  .set('Authorization', 'Bearer ' + oauth2Token)
  .send({
    name: 'lawnmower',
    type: 'item',
    categories: [ 'tools' ],
    image: 'http://www.cpsc.gov/PageFiles/75910/08140b.jpg',
    tags: [ 'gas-powered', 'lawn']
  })
  .expect(201)
  .end( function (err, res) {
    if (err) d.reject(err);
    samples.samples.push( res.body.data );
    d.resolve(samples);
  });

  return d.promise;
};

'use strict';

var server = require('../../../../lib/server.js')
  , url = server.url
  , request = require('supertest')
  , chai = require('chai')
  , expect = chai.expect
  , logger = require('../../../../../app/logging').logger
  , mongoose = require('mongoose')
  , accountFactory = require('../../../../lib/accountFactory.js')
  ;

describe( 'INTEGRATION #/users/:username/items', function() {

  var account;

  before( function (done) {
    server.ready( function () {
      accountFactory.createAuthenticatedAccount(url)
      .then( function (result) {
        account = result;
        console.log(account);
        done();
      });
    });
  });

  after( function (done) {
    account.deleteAccount()
    // .then( function () {
    //   if (server.app) {
    //     server.app.close( done );
    //     // done();
    //   } else {
    //     done();
    //   }
    // });
    .then(done);
  });

  describe('GET #/users/:username/items', function () {

    it('should require authentication', function (done) {
      request(url)
        .get('/users/' + account.username + '/items')
        .set('Accept', 'application/json')
        .expect('Content-Type', 'application/json')
        .expect(401)
        .end(done);
    });

    it('should return an empty list when there are no items', function (done) {
      request(url)
        .get('/users/' + account.username + '/items')
        .set('Authorization', 'Bearer ' + account.oauth2.access_token)
        .set('Accept', 'application/json')
        .set('Content-Type', 'application/json')
        .expect(200)
        .end( function (err, res) {
          if (err) done(err);
          res.body.data.should.be.an.array;
          res.body.data.should.have.length(0);
          done();
        });
    });
  }); // GET #/users/:username/items 

  describe('PUT #/users/:username/items', function () {

    require('../../../../../app/models/item');
    var Item = mongoose.model('Item');
    var id = new mongoose.Types.ObjectId();
    var numberOfAddedItems = 0;
    var punchBowl = {
      name: 'Punch Bowl',
      description: 'A superb punch bowl that will be quench the thirst at your party. Comes with assorted serving ladle',
      picture: 'http://upload.wikimedia.org/wikipedia/commons/thumb/9/99/Punch_Bowl_on_Stand_LACMA_M.91.320.6.jpg/569px-Punch_Bowl_on_Stand_LACMA_M.91.320.6.jpg',       
    };

    after( function() {
      Item.remove( {_id: id}, function(err) {
        if (err) {
          logger.warn( 'Failed to remove the item id=%s created during this test: %s',
            id, err);
        }
      });
    });

    it('should require authentication', function (done) {
      request(url)
        .put('/users/' + account.username + '/items/1234567890abcdef')
        .set('Accept', 'application/json')
        .send(punchBowl)
        .expect('Content-Type', 'application/json')
        .expect(401)
        .end(done);
    });

    it('should only let owning user account update the profile', function(done) {
      request(url)
        .put('/users/' + account.username + Math.random() + '/items/123' )
        .set('Authorization', 'Bearer ' + account.oauth2.access_token)
        .set('Content-Type', 'application/json')
        .send(punchBowl)
        .expect(401)
        .end(done);
    });

    it('should return 201 when a document is saved', function (done) {
      request(url)
        .put('/users/' + account.username + '/items/' + id )
        .set('Authorization', 'Bearer ' + account.oauth2.access_token)
        .set('Accept', 'application/json')
        .set('Content-Type', 'application/json')
        .send(punchBowl)
        .expect(201)
        .end(done);
      ++numberOfAddedItems;
    });

    it('should allow successive updates', function (done) {
      // first one (should do an updated if previous test was ran.)
      request(url)
        .put('/users/' + account.username + '/items/' + id )
        .set('Authorization', 'Bearer ' + account.oauth2.access_token)
        .set('Accept', 'application/json')
        .set('Content-Type', 'application/json')
        .send(punchBowl)
        .expect(201)
        .end( function () {
          // second one.
          request(url)
            .put('/users/' + account.username + '/items/' + id )
            .set('Authorization', 'Bearer ' + account.oauth2.access_token)
            .set('Accept', 'application/json')
            .set('Content-Type', 'application/json')
            .send(punchBowl)
            .expect(201, done);
        }); 
      numberOfAddedItems += 2;
    });

    describe('GET #/users/:username/items', function () {

      // TODO fix. Very very bad test.
      // this is using the same user, with a bunch
      // of puts with the same product on the same
      // id, so if any other tests change above that
      // adds other items to the user, well, this test
      // may break. 
      before(function (done) {
        request(url)
          .put('/users/' + account.username + '/items/' + id )
          .set('Authorization', 'Bearer ' + account.oauth2.access_token)
          .set('Accept', 'application/json')
          .set('Content-Type', 'application/json')
          .send(punchBowl)
          .expect(201, done);
      });

      it('should return all items for that user', function (done) {
        request(url)
          .get('/users/' + account.username + '/items')
          .set('Authorization', 'Bearer ' + account.oauth2.access_token)
          .set('Accept', 'application/json')
          .set('Content-Type', 'application/json')
          .expect(200)
          .end( function (err, res) {
            if (err) done(err);
            res.body.data.should.be.an.array;
            res.body.data.should.have.length(1);
            done();
          });
      });
    }); // GET #/users/:username/items

    describe('GET #/users/:username/items/:id', function () {

      before(function (done) {
        request(url)
          .put('/users/' + account.username + '/items/' + id )
          .set('Authorization', 'Bearer ' + account.oauth2.access_token)
          .set('Accept', 'application/json')
          .set('Content-Type', 'application/json')
          .send(punchBowl)
          .expect(201)
          .end(done);
      });

      it('should require authentication', function (done) {
        request(url)
          .get('/users/' + account.username + '/items/1234567890abcdef')
          .set('Accept', 'application/json')
          .send(punchBowl)
          .expect('Content-Type', 'application/json')
          .expect(401)
          .end(done);
      });

      it('should return a specific item for that user', function (done) {
        request(url)
          .get('/users/' + account.username + '/items/' + id)
          .set('Authorization', 'Bearer ' + account.oauth2.access_token)
          .set('Accept', 'application/json')
          .set('Content-Type', 'application/json')
          .expect(200)
          .end( function (err, res) {
            if (err) done(err);
            res.body.data.should.be.an.array;
            res.body.data.should.have.length(1);
            done();
          });
      });      
    });  // GET #/users/:username/items/:item

  });  // PUT #/users/:username/items  
});
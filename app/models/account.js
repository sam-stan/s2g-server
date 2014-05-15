'use strict';

var mongoose = require('mongoose')
  , Schema = mongoose.Schema
  , crypto = require('crypto')
  , validator = require('validator')
  , logger = require('../logging').logger
  , ObjectId = mongoose.Schema.Types.ObjectId
  , Preferences = require('./preferences')
  ;

/** Options: 
var options = {
  autoindex: false, // This is true by default. NOTE: prod release needs 
                    // this set to true!!
  bufferCommands: false, // Defaults to true
  capped: 1024, // Use it for circular buffers, can be set to a literal 
                // eg: {size: 1024, max: 1000, autoIndex: true}
  collection: 'neighborhoods_test', // specify if you need a different collection name.
  id: false,    // Defaults to true. Renames or Disables a virtual 'id' field
                // accessible from the model.
  _id: false,   // 
  read: '...',  // Controls read behavior. See http://mongoosejs.com/docs/guide.html#read
  safe: true,   // Controls write policy. See http://mongoosejs.com/docs/guide.html#safe
  shardKey: {}, // Used when sharding to specify which shard to use.
  strict: true, // Defaults to true. Ensures that new values not in schema 
                // are not saved to the database.
  toJSON: {},   // Specify options for these serializers.
  toObject: {}, // See http://mongoosejs.com/docs/api.html#document_Document-toObject
  versionKey: 'version'   // Configure the __v to something else.
};
*/

var Account = new Schema({
  created: { type: Date, default: Date.now },
  email: { type: String, required: true, unique: true, index: true, trim: true },
  _neighborhood: { type: ObjectId, ref: 'Neighborhood', required: true, index: true},
  passwordHash: { type: String, required: true },
  salt: String,
  accessTokens: [String],
  // merged from User model
  firstName: { type: String, trim: true },
  lastName: { type: String, trim: true },
  address:  { type: String },
  avatar: String,
  preferences: Preferences
});

Account.path('email').validate( validator.isEmail );

Account.path('avatar').validate( function (url) {
  return validator.isURL( url, {
    protocols: ['http', 'https'],
    require_tld: true,
    require_protocol: true
  });
});

// Account.statics.hashPassword = function(password) {
//   var hash = null;
//   if ( password ) {
//     var p = password.trim()
//       , salt =crypto.randomBytes(20).toString('hex');
//     hash = hashWith(salt, p);
//     // hash = crypto.createHmac('sha1', salt).update(p).digest('hex');
//   }
//   return hash;
// };

function hashWith(password, salt) {
  return crypto.pbkdf2Sync(password, salt, 5000, 30).toString('base64');
}


Account.statics.authenticate = function(username, password, done) {
  this.find({email: username}, function(err,res) {
    if (err) return done(err,res);
    if (res.length === 0) return done(null, null);
    done(null,  res[0]);
  });
};

// Account.statics.getAccountByAccessToken = function(username, token, done) {
//   this.find({email: username, accessTokens: token}, function (err, res) {
//     done(err, res);
//   });
// };

Account.virtual('password').set(function(password) {
    this._password = password;
    this.salt = crypto.randomBytes(16).toString('hex');
    this.passwordHash = hashWith(password, this.salt);
  }).get(function() {
    return this._password;
  });

mongoose.model('Account', Account); 

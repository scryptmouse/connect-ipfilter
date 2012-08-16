var _ = require('lodash');

function Record(params) {
  // If Redis found no record,
  // `params.hash` will be null
  if (params.hash === null)
    params.hash = {};

  // Cache a reference to the redis client
  this.client = params.client;
  // As well as the associated key
  this.key    = params.rkey;

  // Cache of values retrieved from Redis
  this.hash   = {};

  // Tries to cast string-only values
  // to js primitives, if applicable
  _.each(params.hash, function(val, hkey) {
    var testNum = Number(val);

    if (val === 'false')
      val = false;
    else if (val === 'true')
      val = true;
    else if (_.isFinite(testNum))
      val = testNum;

    this.hash[hkey] = val;

  }, this);

  this.hash.ip = params.ip;
}

// ### Helpful wrapper functions
//
// Mostly just convenience wrappers for
// hincrby and hset.

// Increment the so-named counter with key `hkey` (required)
// associated with this record by value `val` (optional, default 1)
Record.prototype.increment = function(hkey, val) {
  val = Number(val) || 1;
  this.client.hincrby(this.key, hkey, val);
};

// Set a specific value for named key 
Record.prototype.set = function(hkey, val) {
  this.client.hset(this.key, hkey, val);
};

module.exports = Record;

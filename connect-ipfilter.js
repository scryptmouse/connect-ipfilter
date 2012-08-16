//     connect-ipfilter 0.0.1-alpha
//     (c) 2012 Alexa Grey, http://github.com/scryptmouse/connect-ipfilter
//     MIT license
var _         = require('lodash')
  , redis     = require('redis')
  , Filter    = require('./filter')
  , Record    = require('./record')
  , generate  = require('./generate')
  , defaultOptions  = require('./options')
  , RequestHelper   = require('./RequestHelper')
  , EventEmitter    = require('events').EventEmitter;

function IPFilter(options) {
  options = options || {};

  // Always call with `new`
  if ( !(this instanceof IPFilter) )
    return new IPFilter(options);

  _(options).defaults(defaultOptions);

  // ## Events
  // Extend IPFilter to include the
  // [EventEmitter API](http://nodejs.org/api/events.html "EventEmitter API docs")
  _(this).defaults(new EventEmitter());

  // ## Filter
  // Instantiate a filter...
  var filter = new Filter();
  // ...and export its `rule` method
  this.rule = filter.rule.bind(filter);

  // ## Automatic Rules
  // If `banned_ips` is defined in the options and is an array,
  // this generates a rule.
  // `banned_action` can also be defined to override
  // the default from
  // [options.default_option](options.html#section-4).
  //
  // Any request from an IP on the list will trigger the rule
  if (_(options.banned_ips).isArray())
    this.rule(generate.banned(options.banned_ips, options.banned_action));

  // `allowed_ips` operates similarly, except as a
  // whitelist. Any IP that is _not_ in the array
  // will trigger the rule.
  if (_(options.allowed_ips).isArray())
    this.rule(generate.allowed(options.allowed_ips, options.allowed_action || options.banned_action));

  // Add any other rules defined in options
  if (_(options.rules).isArray())
    this.rule(options.rules);

  // ## Redis
  // Prefix for keys in Redis
  // (stores as prefix + ip)
  this.prefix = options.prefix;

  // Get connection to Redis. Logic borrowed from
  // [connect-redis](https://github.com/visionmedia/connect-redis "connect-redis")
  var client = this.client = options.client || redis.createClient(options.port || options.socket, options.host, options);

  // Authenticate if password provided
  if (options.pass) {
    client.auth(options.pass, function(err) {
      if (err) throw err;
    });
  }

  // Selects DB if option passed.
  if (options.db) {
    client.select(options.db);
    client.on('connect', (function() {
      this.send_anyways = true;
      this.select(options.db);
      this.send_anyways = false;
    }).bind(client));
  }

  // ## Middleware
  //
  // Gets called in context of the IPFilter
  // instance.
  this.guard = (function (req, res, next) {
    var record_key = this.prefix + req.ip;

    // Search redis for a hash stored under
    // `record_key`, and process the response
    // with a callback bound into the context
    // of the IPFilter instance
    client.hgetall(record_key, (function(err, hash) {
      var record, recordParams, matchedRule;

      recordParams = {
        hash: hash,
        rkey: record_key,
        ip: req.ip,
        client: client
      };

      record = new Record(recordParams);
      // Add a helper object for passing events
      // inside routes back to the IPFilter, or
      // accessing the `record`.
      req[options.helperName] = new RequestHelper(this, record);

      // Iterate through each rule...
      matchedRule = filter.process(record.hash);
      // ...and act on the match, if one was returned
      if (matchedRule)
        matchedRule.action(req, res, next);
      else
        return next();

    }).bind(this));

  }).bind(this);
}

module.exports = IPFilter;

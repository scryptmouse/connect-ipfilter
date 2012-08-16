var Rule  = require('./rule')
  , _     = require('lodash');

// ## Constructor
function Filter() {
  // rule storage
  this._rules = [];
}

// ## rule
//
// Define a rule, or multiple rules at once.
// Supports chaining.
Filter.prototype.rule = function() {
  var rules = _.flatten(Array.prototype.slice.call(arguments));

  _.each(rules, function(definition) {
    var num         = this._rules.length + 1
      , defaultName = 'Rule #' + num;

    _(definition).defaults({name: defaultName});

    this._rules.push(new Rule(definition));

  }, this);

  return this;
};

// ## rules
//
// Alias of `rule`
Filter.prototype.rules = Filter.prototype.rule;

// ## process
//
// Checks each Rule's comparator to see if
// it matches the hash passed in by the Record
// object. Returns the first matching rule or
// `false` if none match.
Filter.prototype.process = function(hash) {
  var rule = _(this._rules).find(function(rule) {
    return rule.check(hash);
  });

  return rule || false;
};

// Export the constructor.
module.exports = Filter;

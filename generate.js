// the `comparators` object stores template functions
// that are used by `generate.comparator`
var comparators = {}
  , generate    = module.exports = {}
  , _           = require('lodash');

// A quick little helper to check if `obj`
// is an object and missing key
function missingKey(obj, key) {
  return obj && _(obj[key]).isUndefined();
}

// ## Whitelists
//
// The following two methods return an object
// that can be directly passed to generate a new
// rule.

// ## banned
// IP blacklist. Creates a rule that activates
// if a requested IP is contained in `list`
generate.banned = function(list, action) {
  return {
    when: function(hash) {
      return !!~list.indexOf(hash.ip);
    },
    action: action
  };
};

// ## allowed
// IP Whitelist. Creates a rule that activates
// if a requested IP is **not** contained in `list`
generate.allowed = function(list, action) {
  return {
    when: function(hash) {
      return !~list.indexOf(hash.ip);
    },
    action: action
  };
};

// ## comparator
// Generates a comparator function ("when" in rule definitions)
// programmatically
generate.comparator = function(key, type, val) {
  /*jshint eqnull:true*/
  var obj = {};

  // It can accept an object as its first
  // parameter, instead of 3 specific args
  // (which is what it receives from
  // [Rule](rule.html))
  //
  // The object is formatted as follows:
  //
  //     var when = {
  //       key: 'failed_logins',
  //       is: 'gte',
  //       val: 5
  //     };
  if (_(key).isObject()) {
    obj   = key;
    key   = obj.key;
    type  = obj.is || obj.type;
    val   = obj.val;
  }

  if (missingKey(comparators, type))
    throw new TypeError('Unknown comparator: ' + type);
  else if (val == null || key == null)
    throw new TypeError('Undefined key / val');

  // It creates a comparator function with
  // `key` and `val` bound as the first two args...
  var comp = comparators[type].bind(undefined, key, val);

  // ...and returns a function that accepts an object
  // and runs it against the comparator if the key exists
  return function(obj) {
    return missingKey(obj, key) ? false : comp(obj);
  };
};

// -----------------------------

// ## Comparator templates
// There are some DSL-ish aliases defined for each.

// **Greater Than or Equal To**, `>=`
//
// * `greater_than_or_equal_to`
comparators.gte = function(key, val, obj) {
  return (obj[key] >= val);
};
comparators.greater_than_or_equal_to = comparators.gte;

// **Greater Than**, `>`
//
// * `greater_than`
comparators.gt = function(key, val, obj) {
  return (obj[key] > val);
};
comparators.greater_than = comparators.gt;

// **Less Than or Equal To**, `<=`
//
// * `less_than_or_equal_to`
comparators.lte = function(key, val, obj ) {
  return (obj[key] <= val);
};
comparators.less_than_or_equal_to = comparators.lte;

// **Less Than**, `<`
//
// * `less_than`
comparators.lt = function(key, val, obj) {
  return (obj[key] < val);
};
comparators.less_than = comparators.lt;

// **Equals**, `===`
//
// * `exactly`
// * `equal_to`
comparators.eq = function(key, val, obj) {
  return (obj[key] === val);
};

comparators.equal_to = comparators.exactly = comparators.eq;

// **Not equals**, `!==`
//
// * `not`
// * `not_equal_to`
comparators.ne = function(key, val, obj) {
  return (obj[key] !== val);
};
comparators.not_equal_to = comparators.not = comparators.ne;

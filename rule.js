var generate = require('./generate')
  , _        = require('lodash');

function Rule(options) {
  options = options || {};

  this._comparators = [];

  if (_.isFunction(options.action))
    this.action = options.action;
  else
    throw new TypeError('Action must be a function');

  // Set the _ method used to test
  // the comparators
  if (_.include(['any', 'all'], options.mode))
    this.mode = options.mode;
  else
    this.mode = 'all';

  if (_.isArray(options.when))
    _.each(options.when, this.addComparator, this);
  else
    this.addComparator(options.when);

  if (_(options.name).isString())
    this.name = options.name;
}

Rule.prototype.addComparator = function(comparator) {
  if (_.isFunction(comparator))
    this._comparators.push(comparator);
  else if (_.isObject(comparator))
    this._comparators.push(generate.comparator(comparator));
  else
    throw new TypeError('Missing comparator definition');

  return this;
};

Rule.prototype.check = function(hash) {
  var checked = _(this._comparators).invoke('call', undefined, hash);
  return _[this.mode](checked, _.identity);
};

module.exports = Rule;

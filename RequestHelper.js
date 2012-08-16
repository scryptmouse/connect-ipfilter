var slice = Array.prototype.slice;

// This gets attached to the Request
// object in Connect/Express (as `.ipfilter`),
// which enables one to trigger events on
// for IPFilter. Will pass the record to
// the main event handler as its first argument,
// followed by any additional event data
//
// You can also simply do something like:
//
// `req.ipfilter.increment('failed');`
//
// instead of using events
function RequestHelper(ipfilter, record) {
  this.record = record;

  // `trigger` or `emit`, by preference.
  this.trigger = this.emit = function(event) {
    var args = [event, record].concat(slice.call(arguments, 1));

    ipfilter.emit.apply(ipfilter, args);
  };

  // Aliases to increment and set methods
  this.increment = record.increment.bind(record);
  this.set = record.set.bind(record);
}

module.exports = RequestHelper;

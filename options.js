var options = module.exports = {};

// Prefix of keys in redis
options.prefix = 'connect-ipfilter:';

// Property name that the helper will
// attached to on the request object.
// Useful if you have more than one
// instance of ipfilter that may overlap
options.helperName = 'ipfilter';

// Default action taken if not
// overriden.
options.default_block = function (req, res, next) {
  res.statusCode = 403;
  res.send('Forbidden');
};

// Alias the default action on (white|black)lists to default_block
options.allowed_action = options.banned_action = options.default_block;

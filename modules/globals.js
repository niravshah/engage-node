var mongo = require('mongodb');
var monk = require('monk');
var db = monk('localhost:27017/engage');

exports.nots = db.get('eg1');
exports.clients = {};

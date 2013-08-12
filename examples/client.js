var Client = require('../lib/client');
var Node = require('../lib/node');

var node = new Node();
var client_connection = Client.createClient(node);


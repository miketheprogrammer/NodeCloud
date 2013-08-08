var Client = require('../client');
var Node = require('../node');

var node = new Node();

setInterval(function() {
    node.emit('random', Math.random());
},1000);
var client_connection = Client.createClient(node);


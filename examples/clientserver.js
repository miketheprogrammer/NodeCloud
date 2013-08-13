var Factory = require('../lib/factory')
var Node = require('../lib/node');
var argv = require('optimist').argv;

var port = argv.p || 5555;

var client = Factory.NodeFactory(new Node(), {client:{
    host: "10.2.43.55",
    port: 5555
}});

client.preferredUsage = argv.cap || '';
client.toReplicate.push('preferredUsage');
var server = require("./server2");
var instance = server.createServer(client, port, null, client.serialize());
client = Factory.NodeFactory(client, {server: {
    instance: instance,
    port: port,
    host: "INADDR_ANY"
}});





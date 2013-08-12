var Factory = require('../lib/factory')
var Node = require('../lib/node');

var client = Factory.NodeFactory(new Node(), {client:{
    host: "10.2.43.55",
    port: 5555
}});
var server = require("./server2");
var instance = server.createServer(client, 5556);
client = Factory.NodeFactory(client, {server: {
    instance: instance,
    port: 5556,
    host: "INADDR_ANY"
}});





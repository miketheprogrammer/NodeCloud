var http = require('http');
var Bouncy = require('bouncy');
var Manager = require("../lib/manager");

exports.createServer = function(node, port, host) {
    process.node = node;
    process.manager = new Manager();
    process.manager.register(process.node);
    var server = http.createServer();
    server.listen(port);
    Bouncy({server:server},function( req, res, bounce ) {
        bounce(process.manager.getBest().remotePort);
    });
};
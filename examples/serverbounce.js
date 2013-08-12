var http = require('http');
var Bouncy = require('bouncy');
var Manager = require("../lib/manager");

/*
  This example creates a server and bounces connections to the best host available.

  Best here is defined by the first child that supports an http server.

  The child node has notified the master of its remote host and port.
*/

// Lets add a function to the Manager for getting the first child with a remote port or host

Manager.prototype.getFirstAvailableServer = function ( ) {
    for ( var key in this.node.children ) {
        var child = this.node.children[key];
        if ( child.remotePort != undefined )
            return child;
    }
}


exports.createServer = function(node, port, host) {
    process.node = node;
    var manager = new Manager();
    manager.register(process.node);
    var server = http.createServer();
    server.listen(port);
    Bouncy({server:server},function( req, res, bounce ) {
        var remoteNode = manager.getFirstAvailableServer();
        var host = remoteNode.remoteAddress;
        var port = remoteNode.remotePort;
        bounce(host, port);
    });
};
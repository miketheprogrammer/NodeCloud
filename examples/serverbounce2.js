var http = require('http');
var Bouncy = require('bouncy');
var Manager = require("../lib/manager");

/*
  This example creates a server and bounces connections to the best host available.

  Best here is defined as random.

  The child node has notified the master of its remote host and port.
*/

// Lets add a function to the Manager for getting the first child with a remote port or host

function randomFromInterval(from,to)
{
    return Math.floor(Math.random()*(to-from+1)+from);
}
Manager.prototype.getRandom = function ( ) {
    var keys = Object.keys(this.node.children);

    var random = randomFromInterval(0,keys.length-1);
    
    var randomKey = keys[random];
    //console.log(random, randomKey);
    return this.node.children[randomKey];
}


exports.createServer = function(node, port, host) {
    process.node = node;
    var manager = new Manager();
    manager.register(process.node);
    var server = http.createServer();
    server.listen(port);

    /*
      We need to set the timeout for this example
      or we will always maintain a connection with the same
      child.
     */
    server.on('connection', function ( stream ) {
        stream.setTimeout(1000*8);
        stream.on('close', function( had_error ) {
        });
    });
    Bouncy({server:server}, function( req, res, bounce ) {
        var remoteNode = manager.getRandom();
        if ( remoteNode == undefined || remoteNode == null ){
            
            res.end("No server available");
            return;
        }
        var host = remoteNode.remoteAddress;
        var port = remoteNode.remotePort;
        if ( host )
            bounce(host, port).pipe(backpressure);
        else bounce(port);
    });
};
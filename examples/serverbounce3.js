var http = require('http');
var Bouncy = require('bouncy');
var Manager = require("../lib/manager");
var brake = require("brake");
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
Manager.prototype.getLeastHeap = function ( ) {
    var least = null;

    for ( var key in this.node.children ) {
        var current = this.node.children[key];
        try {
            var l = least.memoryUsage.heapUsed/least.memoryUsage.heapTotal;
            var c = current.memoryUsage.heapUsed/current.memoryUsage.heapTotal;
            if ( c < l ) {
                least = current;
            }
        } catch ( e ) {
            least = current;
        }
    }
    return least;

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
        //res.pipe(brake(2000)).pipe(res);
        var remoteNode = manager.getLeastHeap();
        if ( remoteNode == undefined || remoteNode == null ){
            res.end("No server available");
            return;
        }
        res.on('close', function ( a ) {
            //here we might want to
            //de-count from a count of
            //current load on a child
            //to aid in routing
        });
        var host = remoteNode.remoteAddress;
        var port = remoteNode.remotePort;
        if ( host )
            bounce(host, port);
        else bounce(port);
    });
};
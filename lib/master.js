var Net = require('net');
var MuxDemux = require('mux-demux');
var EmitStream = require('emit-stream');

var defaults = {
    port: 5555,
    host: "INADDR_ANY",
    eventHandlers: {
        listening: function() {
            console.log("Server Listening on " 
                        + defaults.host
                        + ":"
                        + defaults.port);
        },
    }
};

exports.apply = function ( node, opts ) {
    opts = opts || {};
    if ( Object.keys(opts).length == 0 )
        opts = defaults;

    node.isMaster = true;

    node._emits['heartbeat'] = true;

    node._initialize();

    createServer( node, opts );

    return node;

}

function createServer ( node, opts ) {
    var server = Net.createServer(function (connection) {
        
        var mux = MuxDemux();
        node.remoteAddress = connection.remoteAddress;
        mux.on('connection', function(stream) {
            console.log("Server: New Connection");
            node.in = EmitStream(stream);
            EmitStream(node.in).pipe(EmitStream(node.merge))
            node.applyCallbacks();
            EmitStream(node.out).pipe(mux.createStream('emit'));
        });
        mux.on('error', function ( e) {
            connection.end();
        });
        connection.pipe(mux).pipe(connection);
        
        

    });
    server.on('error', function ( e ) {
        console.log(e);
    });

    if ( opts.host == 'INADDR_ANY')
        server.listen(opts.port);
    else
        server.listen(opts.port, opts.host);

    for ( var key in opts.eventHandlers ) {
        server.on( key, opts.eventHandlers[key] )
    }
    
    node.server = server;
    return node;
}
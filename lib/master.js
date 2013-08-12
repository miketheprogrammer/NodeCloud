var Net = require('net');
var MuxDemux = require('mux-demux');
var EmitStream = require('emit-stream');
var Events = require("events");
var EventEmitter = Events.EventEmitter2 || Events.EventEmitter;
var JSONStream = require('JSONStream');
var Node = require('./node');

var defaults = {
    port: 5555,
    host: "INADDR_ANY",
    eventHandlers: {
        listening: function() {
            console.log("Server Listening on " 
                        + this.host
                        + ":"
                        +this.port);
        },
    }
};
exports.createMaster = function ( node, opts ) {
    opts = opts || {};
    if ( Object.keys(opts).length == 0 )
        opts = defaults;

    node.isMaster = true;
    node._emits['heartbeat'] = true;
    node._initialize();

    var server = Net.createServer(function (connection) {
        var mux = MuxDemux();

        mux.on('connection', function(stream) {
            console.log("Server: New Connection");
            node.in = EmitStream(stream);
            EmitStream(node.in).pipe(EmitStream(node.merge))
            node.applyCallbacks();
        });
        connection.pipe(mux).pipe(connection);
        EmitStream(node.out).pipe(mux.createStream('emit'));
    });

    if ( opts.host == 'INADDR_ANY')
        server.listen(opts.port);
    else
        server.listen(opts.port, opts.host);

    for ( var key in opts.eventHandlers ) {
        server.on( 'key', opts.eventHandlers[key] )
    }

    return server;

}

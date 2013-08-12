var Net = require('net');
var MuxDemux = require('mux-demux');
var EmitStream = require('emit-stream');
var Events = require("events");
var EventEmitter = Events.EventEmitter2 || Events.EventEmitter;
var JSONStream = require('JSONStream');
var uuid = require("node-uuid");
var Node = require('./node');
var mux = MuxDemux();

var defaults = {
    port: 5555,
    host: "INADDR_ANY",
};
exports.createClient = function ( node, opts) {
    opts = opts || {};
    if ( Object.keys(opts).length == 0 )
        opts = defaults;

    node.isClient = true;
    node._emits['heartbeat'] = false;
    node.accepts['heartbeat'] = function( remoteUUID ) {
        node.parent = remoteUUID;
        node.out.emit('heartbeat-ack', 'aknowledged by ' 
                      + node.uuid +'\r\n', node.serialize());
    }
    if ( opts.host == 'INADDR_ANY' )
        node.connection = Net.connect(opts.port);
    else
        node.connection = Net.connect(opts.port, opts.host);

    mux.pipe(node.connection).pipe(mux);
    var outStream = mux.createStream('emit');
    EmitStream(node.out).pipe(outStream);
    mux.on('connection', function(stream) {
        node.in = EmitStream(stream);
        node.in.setMaxListeners(20);
        node.applyCallbacks();
        node.out.emit('online', node.uuid);
    });

    return node.connection;
}
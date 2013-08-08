var Net = require('net');
var MuxDemux = require('mux-demux');
var EmitStream = require('emit-stream');
var Events = require("events");
var EventEmitter = Events.EventEmitter2 || Events.EventEmitter;
var JSONStream = require('JSONStream');
var uuid = require("node-uuid");
var Node = require('./node');

exports.createMaster = function ( node ) {
    node._emits['heartbeat'] = true;
    node._initialize();
    var server = Net.createServer(function (connection) {
        var mux = MuxDemux();
        mux.on('connection', function(stream) {
            console.log("Server: New Connection");
            node.in = EmitStream(stream);
            EmitStream(node.in).pipe(EmitStream(node.merge))
            node.applyCallbacks();
            node.applyCallbacks();
            console.log(node.merge);
        });
        connection.pipe(mux).pipe(connection);
        var emit = mux.createStream('emit');
        EmitStream(node.out).pipe(emit);
    });

    server.listen(5555);

    server.on('listening', function() {
        console.log("Server started");
    });

    return server;

}

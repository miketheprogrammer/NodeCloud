var Net = require('net');
var MuxDemux = require('mux-demux');
var EmitStream = require('emit-stream');
var Events = require("events");
var EventEmitter = Events.EventEmitter2 || Events.EventEmitter;
var JSONStream = require('JSONStream');
var uuid = require("node-uuid");
var Node = require('./node');
var mux = MuxDemux();

exports.createClient = function ( node ) {
    node.accepts['heartbeat'] = function( remoteUUID ) {
        //console.log('Received Heartbeat request from : ' 
        //            + remoteUUID + '\r\n');
        node.parent = remoteUUID;
        node.out.emit('heartbeat-ack', 'aknowledged by ' 
                      + node.uuid +'\r\n', node.serialize());
    }
    node.connection = Net.connect(5555);
    mux.pipe(node.connection).pipe(mux);
    var outStream = mux.createStream('emit');
    EmitStream(node.out).pipe(outStream);
    mux.on('connection', function(stream) {
        //console.log(stream);
        node.in = EmitStream(stream);
        node.applyCallbacks();
        node.out.emit('online', node.uuid);
    });

    return node.connection;
}
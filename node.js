var MuxDemux = require('mux-demux');
var EmitStream = require('emit-stream');
var Events = require("events");
var EventEmitter = Events.EventEmitter2 || Events.EventEmitter;
var JSONStream = require('JSONStream');
var uuid = require("node-uuid");

function Node (node) {
    if (node) {
        for ( var key in node )
            this[key] = node[key];
    } else {
        var node = this;
        this.uuid = uuid.v4();
        this.stats();
        this.accepts = {
            'heartbeat-ack': function( response, child_node ) {
                console.log("Server Client Responsed with: " 
                            + response + '\r\n');
                node.merge.emit('heartbeat-ack', response, child_node);
            },
            'online': function( response ) {
                console.log("Child " + response + " is online.");
            },
        };
        this._emits = {'heartbeat':true,
                       'heartbeat-ack':true}
        this.out = new EventEmitter;
        this.in = new EventEmitter;
        this.merge = new EventEmitter;
        this.connection = undefined;
        this.children = [];
    }
}
Node.prototype.stats = function() {        
        this.pid = process.getuid();
        this.version = process.version;
        this.memoryUsage = process.memoryUsage();
        this.uptime = process.uptime();
};
Node.prototype.serialize = function() {
    this.stats();
    return JSON.stringify( {
        uuid: this.uuid,
        pid: this.pid,
        version: this.version,
        memoryUsage: this.memoryUsage,
        uptime: this.uptime,
    });
};

Node.prototype._initialize = function ( ) {
    this._heartbeat();
}
Node.prototype._heartbeat = function ( ) {
    if ( 'heartbeat' in this._emits )
        if ( this._emits['heartbeat'] ) {
            var node = this;
            setInterval(function() {
                node.out.emit('heartbeat', node.uuid);
            },200);
        }
}

Node.prototype.applyCallbacks = function ( ) {
    for ( var key in this.accepts ) {
        this.in.removeListener(key, this.accepts[key]);
        this.in.on(key, this.accepts[key]);
    }
}

Node.prototype.on = function(evt, listener) {
    this.accepts[evt] = listener;
    this.applyCallbacks();
}

Node.prototype.emit = function(evt) {
    this.out.emit.apply(evt, arguments);
}

Node.prototype.removeListener = function(evt, listener) {
    delete this.accepts[evt];
    this.in.removeListener(evt, listener);
}

module.exports = Node;
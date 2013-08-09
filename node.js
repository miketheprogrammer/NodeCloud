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
                var child = JSON.parse(child_node);
                node.children[child.uuid] = child;
                node.children_acknowledged[child.uuid] = Date.now();
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
        this.children = {};
        this.children_acknowledged = {};
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
        children: this.children,
    });
};

Node.prototype._initialize = function ( ) {
    this._heartbeat();
}
Node.prototype._heartbeat = function ( ) {
    var heartbeat_interval = 200;
    if ( 'heartbeat' in this._emits ) {
        if ( this._emits['heartbeat'] ) {
            var node = this;
            setInterval(function() {
                node.out.emit('heartbeat', node.uuid);
            },heartbeat_interval);

            setInterval(function() {
                min_time = new Date(Date.now() - heartbeat_interval * 5)
                for ( var key in node.children_acknowledged ) {
                    console.log("checking " + key);
                    if ( node.children_acknowledged[key] < min_time) {
                        delete node.children[key];
                        delete node.children_acknowledged[key];
                        node.merge.emit('expired', key);
                    }
                }
            }, heartbeat_interval*2);
        }
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
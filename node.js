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
                var child = JSON.parse(child_node);
                node.children[child.uuid] = child;
                node.children_acknowledged[child.uuid] = Date.now();
            },
            'online': function( response ) {
                console.log("Child " + response + " is online.");
            },
            '/': function( request ) {
                node.numRequests += 1;
                setTimeout(function() {
                    node.emit('/-res-'+node.parent, "Hello World:"+node.numRequests);
                }, 1000);
                
            },
        };
        this._emits = {'heartbeat':true,
                       'heartbeat-ack':true}
        this.out = new EventEmitter;
        this.in = new EventEmitter;
        this.merge = new EventEmitter;
        this.out.setMaxListeners(20);
        this.in.setMaxListeners(20);
        this.merge.setMaxListeners(20);
        this.connection = undefined;
        this.children = {};
        this.children_acknowledged = {};
        this.toReplicate = [];
        this.numRequests = 0;
        this.debug();
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
    
    var obj = {};
    for ( var key in this ) {
        if (this.toReplicate.indexOf(key) != -1){
            obj[key] = this[key];
        }
    }
    return JSON.stringify( {
        uuid: this.uuid,
        pid: this.pid,
        version: this.version,
        memoryUsage: this.memoryUsage,
        uptime: this.uptime,
        children: this.children,
        numRequests: this.numRequests,
        listenerCount: EventEmitter.listenerCount(this.in,'/-res-'+this.uuid),
    });
    return JSON.stringify( obj );
};

Node.prototype.debug = function( ) {
    var node = this;
    var a = setInterval(function debug() {
        //console.log("Total Number of Requests: " + node.numRequests);
    },1000);
};

Node.prototype._initialize = function ( ) {
    var node = this;

    this._heartbeat();
    this.toReplicate = [
        'uuid',
        'pid',
        'version',
        'memoryUsage',
        'uptime',
        'children',
        'numRequest',
    ];
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
        this.in.removeListener(key + '-' + this.uuid, this.accepts[key])
        //Broadcast Event
        this.in.on(key, this.accepts[key]);
        //Targeted Event
        this.in.on(key + '-' + this.uuid, this.accepts[key]);
    }
}

Node.prototype.on = function(evt, listener) {
    //this.in.removeListener(evt, listener)
    this.in.on(evt, listener);
}
Node.prototype.once = function( evt, listener ) {
    this.in.setMaxListeners(1000);
    this.in.once(evt, listener);
}

Node.prototype.emit = function(evt) {
    this.out.emit.apply(evt, arguments);
}

Node.prototype.removeListener = function(evt, listener) {
    delete this.accepts[evt];
    this.in.removeListener(evt, listener);
}

module.exports = Node;
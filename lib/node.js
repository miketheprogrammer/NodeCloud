var MuxDemux = require('mux-demux');
var EmitStream = require('emit-stream');
var Events = require("events");
var EventEmitter = Events.EventEmitter2 || Events.EventEmitter;
var JSONStream = require('JSONStream');
var uuid = require("node-uuid");
var os = require('os');
var util = require('util');

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
                if ( child.uuid in node.children ) {
                    for ( var key in child ) {
                        node.children[child.uuid][key] = child[key];
                    }
                } else {
                    node.children[child.uuid] = child;
                }
                node.children_acknowledged[child.uuid] = Date.now();
            },
            'online': function( response ) {
                response = JSON.parse(response);
                console.log(util.inspect(response, false, null));
                node.children[response.uuid] = response;
                if ('serverConfig' in response)
                    node.children[response.uuid]['remotePort'] = response.serverConfig.port;
                
                console.log("Child " + response.uuid + " is online.");
            },
            '/': function( request ) {
                node.numRequests += 1;
                var res = ''
                for(var i = 0; i < 20; i++) {
                    res += node.serialize();
                }
                node.emit('/-res-'+node.parent, res);
                
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
        this.toReplicate = [
            'uuid',
            'pid',
            'version',
            'memoryUsage',
            'uptime',
            'children',
            'numRequests',
            'os'
        ];
        this.numRequests = 0;
    }
}
Node.prototype.stats = function() {        
    this.pid = process.getuid();
    this.version = process.version;
    this.memoryUsage = process.memoryUsage();
    this.uptime = process.uptime();
    this.os = {
        type: os.type(),
        platform: os.platform(),
        architecture: os.arch(),
        uptime: os.uptime(),
        loadAverage: os.loadavg(),
        totalMemory: os.totalmem(),
        freeMemory: os.freemem(),
        memUsage: os.freemem()/os.totalmem(),
        cpus: os.cpus(),
    }
};
Node.prototype.serialize = function() {
    this.stats();
    
    var obj = {};
    for ( var key in this ) {
        if (this.toReplicate.indexOf(key) != -1){
            obj[key] = this[key];
        }
    }
    obj['listenerCoount'] = EventEmitter.listenerCount(this.in,'/-res-'+this.uuid);
    return JSON.stringify( obj );
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
var Net = require('net');
var MuxDemux = require('mux-demux');
var EmitStream = require('emit-stream');


var defaults = {
    port: 5555,
    host: "INADDR_ANY", //Master is on localhost
};


var apply = function ( node, opts) {
    opts = opts || {};
    if ( Object.keys(opts).length == 0 )
        opts = defaults;

    configure( node, opts );


    getConnection( node, opts );

    var mux = MuxDemux();
    installPlumbing( node, opts, mux );

    return node;
}
exports.apply = apply;


function installPlumbing ( node, opts, mux ) {
    mux.pipe(node.connection).pipe(mux);
    var outStream = mux.createStream('emit');
    EmitStream(node.out).pipe(outStream);
    mux.on('connection', function(stream) {
        node.in = EmitStream(stream);
        node.in.setMaxListeners(20);
        node.applyCallbacks();
        node.out.emit('online', node.serialize());
    });

    mux.on('error', function ( e ) {
        console.log(e);
    });
}

function getConnection ( node, opts ) {
    if ( node.connection ) {
        node.connection.removeAllListeners('error');
        node.connection.removeAllListeners('close');
        node.connection.removeAllListeners('connect');
    }

    if ( opts.host == 'INADDR_ANY' )
        node.connection = Net.connect(opts.port);
    else 
        node.connection = Net.connect(opts.port, opts.host);

    node.connection.on('error', function ( e ) {
        node.connection.destroy();
    });
    node.connection.on('close', function ( c ) {
        node.retry = setTimeout(function() {
            apply(node, opts);
        }, 1000);
    });
    node.connection.on('connect', function ( c ) {
        clearTimeout(node.retry);
    });
    return node;
}

function configure( node, opts ) {
    node.isClient = true;
    node._emits['heartbeat'] = false;
    node.accepts['heartbeat'] = function( remoteUUID ) {
        node.parent = remoteUUID;
        node.out.emit('heartbeat-ack', 'aknowledged by ' 
                      + node.uuid +'\r\n', node.serialize());
    }
}
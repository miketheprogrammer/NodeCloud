var Master = require('./master');
var Client = require('./client');
var Node = require('./node');

var instantiate = require("instantiate");

/*
  This Factory will turn a node into a Master or
  slave or both.

  You should provide a preconfigured node, however if node
  is provided one will be returned with a default config.

  You should provide options as per the documentation.
*/

exports.NodeFactory = function f( node, opts ) {
    node = node || instantiate.new(Node)
    opts = opts || {}
    

    if ( opts.master != undefined )
        Master.apply( node, opts.master );

    if ( opts.client != undefined )
        Client.apply( node, opts.client );

    if ( opts.server != undefined ) 
        registerServer( node, opts.server );

    if ( !!opts.master && !!opts.client )
        console.warn("Warning: bare node returned, no plumbing");

    return node;
}

function registerServer ( node, opts ) {
    node.server = opts.instance;
    node.serverConfig = {
        port: opts.port,
        host: opts.host
    }
}
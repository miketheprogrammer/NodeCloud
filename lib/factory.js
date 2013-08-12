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
    
    console.log(Master.createMaster.toString());
    for ( var key in opts ) {
        this[key] = opts[key];
    }

    if ( this.master )
        Master.createMaster( node, opts );

    if ( this.client )
        Client.createClient( node, opts );

    if ( !!this.master && !!this.slave )
        console.warn("Warning: bare node returned, no plumbing");

    return node;
}
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
    
    for ( var key in opts ) {
        this[key] = opts[key];
    }

    if ( this.master )
        Master.apply( node, this.master );

    if ( this.client )
        Client.apply( node, this.client );

    if ( !!this.master && !!this.client )
        console.warn("Warning: bare node returned, no plumbing");

    return node;
}
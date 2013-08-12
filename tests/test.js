var test = require('tap').test;

var Master = require("../lib/master");
var Client = require("../lib/client");
var Node = require('../lib/node');
var Factory = require( '../lib/factory' );

(function mock () {
    Master.createMaster = function ( node ) {
        node.isMaster = true;
        return node;
    };
    Client.createClient = function ( node ) {
        node.isClient = true;
        return node;
    }

})();


test("Massaged Node Should Be Same as Input", function( t ) {
    t.plan(1);
    var node = new Node();
    node.x = true;

    node = Factory.NodeFactory(node, {master:{}});

    t.ok(node.x);

});


test("Node should be able to be both Master and Client", function(t){
    t.plan(2);
    var node = new Node();
    
    node.x = true;

    t.ok(Factory.NodeFactory(node, { master:{}, client:{} } ));

    t.same(node.x, true);
});

test("A Node instance is returned by Factory by default", function(t){
    t.plan(1);
    var node = Factory.NodeFactory( null, { master: {} } );

    t.ok(node instanceof Node);

});

test("Node has been properly massaged", function( t ) {
    t.plan(2);
    var node = Factory.NodeFactory( null, { master:{}, client:{} } );

    t.ok(node.isMaster);
    t.ok(node.isClient);

});
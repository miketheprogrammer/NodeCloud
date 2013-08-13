var test = require('tap').test;

var NodeCloud = require("../index");
var Master = NodeCloud.Master;
var Client = NodeCloud.Client;
var Node = NodeCloud.Node;
var Factory = NodeCloud.Factory;

(function mock () {
    Master.apply = function ( node ) {
        node.isMaster = true;
        return node;
    };
    Client.apply = function ( node ) {
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

test("Factory Client with server argument", function( t ) {
    t.plan(3);

    var serverInstance = {a:1}
    var port = 5555;
    var host = "localhost";
    var node = Factory.NodeFactory( null, {
        client: {},
        server: {
            instance: serverInstance,
            port: port,
            host: host
        }
    });

    t.same(node.server, serverInstance);
    t.same(node.serverConfig.port, port);
    t.same(node.serverConfig.host, host);
});

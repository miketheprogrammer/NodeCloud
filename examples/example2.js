var Master = require('../lib/master');
var Node = require('../lib/node');
var Factory = require("../lib/factory");

var node = Factory.NodeFactory( node , {master:{} });

var shoe = require('shoe');
var http = require('http');
var ecstatic = require('ecstatic');
var server = http.createServer(ecstatic(__dirname + '/static'));
var JSONStream = require('JSONStream');
var MuxDemux = require("mux-demux");
var EmitStream = require("emit-stream");

server.listen(8080);

var apiserver = require("./serverbounce2");
apiserver.createServer(node, 8000);

var sock = shoe(function ( stream ) {
    var mdm = MuxDemux();
    mdm.pipe(stream).pipe(mdm);

    var wr = mdm.createWriteStream('emit-merge')
    EmitStream(node.merge)
            .pipe(wr);
    
    setInterval(function() {
        node.merge.emit('update', true, node.serialize());
    },400);
});


sock.install(server, '/sock');


var names = [
    'Michael',
    'James',
    'Andrew',
    'Tim',
    'Phillip',
    'Jimmy',
    'Ralph',
    'Jenny',
    'Amanda',
    'Erica'
]

for( var i = 1; i < 11; i++ ) {
    var Factory = require('../lib/factory')
    var Node = require('../lib/node');

    var client = Factory.NodeFactory(new Node(), {client:{
        host: "10.2.43.55",
        port: 5555
    }});

    var server2 = require("./server2");
    var instance = server2.createServer(client, 6000+i,undefined, "Hello "+names.pop());
    client = Factory.NodeFactory(client, {server: {
        instance: instance,
        port: 6000+i,
        host: "INADDR_ANY"
    }});
}





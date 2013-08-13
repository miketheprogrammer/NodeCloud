NodeCloud
===================

An Evented Network Stream Clustering Solution

[![build status](https://secure.travis-ci.org/miketheprogrammer/NodeCloud.png)](http://travis-ci.org/miketheprogrammer/NodeCloud)


Extended Description
===================
Node Cloud is a Network Cluster Management Solution. It uses raw network sockets with a streaming event layer, to communicate between Nodes.

The basis of this system is that it is simple enough to achieve anything. From propagating requests through events, or using the replication to determine the best node for a proxy bounce request. 

I envisioned that a server in NodeJs should act just like what its name implies ... a Node. Being that NodeJS instances are single threaded, having a network cluster solution is a logical need.

More importantly as this project progresses, any Network Topology will be achievable. From a single Master - Slave, to Star, Ring, Master-Ring  - Slave, Webbed. 

The most important aspect of this system, is its use of events { and possibly in the future RPC } to communicate between nodes. Events are the perfect solution for this. 

We can Broadcast event "heartbeat" or we can target event "heartbeat-{node-uuid}";

NodeJS Stream layer is perfect for plumbing everything together in a coherent functional way.


The API. ( Currently In active development. Simplicity is an eventual goal. )
==================
The NodeCloud interface exposes 4 libraries.
1. Node - The Base Node Class, Inherit from here to configure various nodes.
2. Master - Exposes func .apply - Use this to add Master Capabilities to a Node
3. Client - Exposes func .apply - Use this to add Client Capabilities to a Node
4. Factor - Exposes function to create Master, Client, and an important helper function. Binding a web server to a Node
            and exposing it in the replication engine. 

Example Master
````javascript
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

var apiserver = require("./serverbounce");
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

````

All the above example really does is 
1. Create a Master Node
2. Create an HttpServer For Examining the nodes
3. Create an API Http Server for making bounc request to children
4. Create a Socket for the Frontend to connect to and get Events through a stream/
5. Emit Update Events at intervals of 400 seconds


Example Client
````javascript
var Factory = require('../lib/factory')
var Node = require('../lib/node');

var client = Factory.NodeFactory(new Node(), {client:{
    host: "10.2.43.55",
    port: 5555
}});

var server = require("./server2");
var instance = server.createServer(client, 5556);
client = Factory.NodeFactory(client, {server: {
    instance: instance,
    port: 5556,
    host: "INADDR_ANY"
}});
````
The above:
1. Creates a Client Node
2. Creates a Web Server
3. Passes the Client Node back to the factory with the Server Args





````javascript
````


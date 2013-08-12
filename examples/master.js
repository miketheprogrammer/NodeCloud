var Master = require('../lib/master');
var Node = require('../lib/node');

var node = new Node();

var master = Master.createMaster(node);

var shoe = require('shoe');
var http = require('http');
var ecstatic = require('ecstatic');
var server = http.createServer(ecstatic(__dirname + '/static'));
var JSONStream = require('JSONStream');
var MuxDemux = require("mux-demux");
var EmitStream = require("emit-stream");
server.listen(8080);
var apiserver = require("./server");
apiserver.createServer(node);

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



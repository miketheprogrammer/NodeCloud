var Master = require('../master');
var Node = require('../node');

var node = new Node();

node.on('random', function( e ) {
    console.log(e);
    node.merge.emit('random', e);
});

var master = Master.createMaster(node);


var shoe = require('shoe');
var http = require('http');
var ecstatic = require('ecstatic');
var server = http.createServer(ecstatic(__dirname + '/static'));
var JSONStream = require('JSONStream');
var MuxDemux = require("mux-demux");
var EmitStream = require("emit-stream");
server.listen(8080, 'localhost');

var sock = shoe(function ( stream ) {
    var mdm = MuxDemux();
    mdm.pipe(stream).pipe(mdm);

    var wr = mdm.createWriteStream('emit-merge')
    EmitStream(node.merge)
            .pipe(wr);
    
    setInterval(function() {
        //wr = mdm.createWriteStream('emit');
        //EmitStream(node.in).pipe(wr);
    },100);
});

sock.install(server, '/sock');


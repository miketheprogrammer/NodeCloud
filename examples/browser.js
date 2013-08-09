var shoe = require('shoe');
var stream = shoe('/sock');
var emitStream = require('emit-stream');
var MuxDemux = require('mux-demux');

/*
stream.on('data', function(buf) {
    document.body.textContent += buf;
});
*/

var mdx = MuxDemux();

window.nodes = {};
mdx.on('connection', function(c) {
    if ( c.meta === 'emit-merge') {
        var emitter = emitStream(c);
        emitter.on('update', function(response, master_node) {
            window.parseNode(master_node);
        });
        emitter.on('expired', function( key ) {
            console.log('removing');
            var div = document.getElementById(key);
            div.parentNode.removeChild(div);
            delete nodes[key];
        });
    }
});
window.parseNode = function( node ) {

    if (node.uuid == undefined ) 
        node = JSON.parse(node);
    if (!(node.uuid in window.nodes ) ){
        window.nodes[node.uuid] = node;
        var div = document.createElement("div");
        div.id = node.uuid;
        var content = document.createTextNode(JSON.stringify(window.nodes[node.uuid]));
        div.appendChild(content);
        document.getElementById("workers").appendChild(div);
    } else {
        var _node = window.nodes[node.uuid];
        for ( var key in node ) {
            _node[key] = node[key];
        }
        document.getElementById(_node.uuid).textContent = JSON.stringify(_node);
    }

    if ( node.children ) {
        for ( nodeUUID in node.children ) {
            window.parseNode(node.children[nodeUUID]);
        }
    }
}

mdx.pipe(stream).pipe(mdx);
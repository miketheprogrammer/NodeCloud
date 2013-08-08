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
    document.body.innerHTML += 'connection<br/>';
    
    if ( c.meta === 'emit-merge') {
        var emitter = emitStream(c);

        emitter.on('heartbeat-ack', function(response, child_node) {
            var node = JSON.parse(child_node);
            if (!(node.uuid in window.nodes ) ){
                window.nodes[node.uuid] = node;
                var div = document.createElement("div");
                div.id = node.uuid;
                var content = document.createTextNode(JSON.stringify(window.nodes[node.uuid]));
                div.appendChild(content);
                document.body.appendChild(div);
            } else {
                var _node = window.nodes[node.uuid];
                for ( var key in node ) {
                    _node[key] = node[key];
                }
                document.getElementById(_node.uuid).textContent = JSON.stringify(_node);
            }
            
            
        });
    }
});

mdx.pipe(stream).pipe(mdx);
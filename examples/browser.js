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
        emitter.on('something', function ( res ) {
            console.log(res);
        });
    }
});

window.generateTable = function( node ) {
    var html = "<tr>";
    for (var key in node) {
        if ( key != 'children' && key != 'memoryUsage') {
            if ( key == 'uptime' )
                node[key] = parseInt(node[key]);
            html += "<td>" + key + ": " + node[key] + "</td>";
        }
        if ( typeof node[key] == 'object' && key != 'chilren') {
            for ( var subkey in node[key] ) {
                html += "<td>" + subkey + ": " + node[key][subkey] +"</td>";
            }
                 
        }
    }
    return html += "</tr>";
}

window.parseNode = function( node ) {

    if (node.uuid == undefined ) 
        node = JSON.parse(node);
    if (!(node.uuid in window.nodes ) ){
        window.nodes[node.uuid] = node;
        var div = $("#worker-id").clone();
        div.attr('id', node.uuid);
        div.find("#worker-stats").html(window.generateTable(node));
        div.find("#worker-stats").attr("id", node.uuid + "-stats");
        div.find("#worker-id-progressbar").attr("id", node.uuid + "-progressbar");
        div.find("#"+node.uuid+"-progressbar").progressbar( {
            value: parseInt((node.memoryUsage.heapUsed/node.memoryUsage.heapTotal) * 100)
        });
        
        $("#workers").append(div);
    } else {
        var _node = window.nodes[node.uuid];
        for ( var key in node ) {
            _node[key] = node[key];
        }
        $("#"+_node.uuid+"-stats").html(window.generateTable(_node));
        $("#"+_node.uuid+"-progressbar").progressbar( {
            value: parseInt((_node.memoryUsage.heapUsed/_node.memoryUsage.heapTotal) * 100)
        });
    }

    if ( node.children ) {
        for ( nodeUUID in node.children ) {
            window.parseNode(node.children[nodeUUID]);
        }
    }
}

mdx.pipe(stream).pipe(mdx);
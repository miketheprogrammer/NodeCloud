var shoe = require('shoe');
var emitStream = require('emit-stream');
var MuxDemux = require('mux-demux');

var stream = shoe('/sock');
var mdx = MuxDemux();


window.nodes = {};
mdx.on('connection', function(c) {
    if ( c.meta === 'emit-merge') {
        var emitter = emitStream(c);
        emitter.on('update', function(response, master_node) {
            window.parseNode(master_node);
            if ( window.needBoxLayer == undefined) {
                window.needBoxLayer = false;
                stage.add(boxLayer);
            }
        });
        emitter.on('expired', function( key ) {
            console.log('removing');
            boxLayer.remove(nodes[key]);
            delete nodes[key];
        });
        emitter.on('something', function ( res ) {
            console.log(res);
        });
    }
});

window.parseNode = function( node, currentLayer, layerCount ) {
    layerCount = layerCount || 1;
    currentLayer = currentLayer || 1;
    if (node.uuid == undefined ) 
        node = JSON.parse(node);
    if (!(node.uuid in window.nodes ) ){
        window.nodes[node.uuid] = node;
        console.log(currentLayer, layerCount);
        createNode(node, layerCount * 60, currentLayer * 60*2);
        
    } else {
        var _node = window.nodes[node.uuid];
        for ( var key in node ) {
            _node[key] = node[key];
        }
    }
    if ( node.children ) {
        layerCount = 1;
        for ( nodeUUID in node.children ) {
            layerCount += 1;
            window.parseNode(node.children[nodeUUID], currentLayer+1, layerCount);
            
        }
    }

    
}

mdx.pipe(stream).pipe(mdx);

function writeMessage(messageLayer, message) {
    var context = messageLayer.getContext();
    messageLayer.clear();
    context.font = '18pt Calibri';
    context.fillStyle = 'black';
    context.fillText(message, 10, 25);
}
$(document).ready(function() {

window.stage = new Kinetic.Stage({
    container: 'renderLayer',
    width: 1000,
    height: 1000
});
window.boxLayer = new Kinetic.Layer();
window.messageLayer = new Kinetic.Layer();

    currentLayer=1;
    createNode({}, currentLayer * 100, currentLayer * 100);
stage.add(messageLayer);

});

function createNode(node, rectX, rectY) {
    //var rectX = stage.getWidth() / 2 - 50;
    //var rectY = stage.getHeight() / 2 - 25;
    console.log(rectX, rectY);
    var box = new Kinetic.Rect({
        x: rectX,
        y: rectY,
        width: 50,
        height: 50,
        fill: '#00D2FF',
        stroke: 'black',
        strokeWidth: 4,
        draggable: true
    });

    // write out drag and drop events
    box.on('dragstart', function() {
        writeMessage(messageLayer, 'dragstart');
    });
    box.on('dragend', function() {
        writeMessage(messageLayer, 'dragend');
    });
    node.obj = box;
    boxLayer.add(box);
}
var express = require('express');

var getFirst = function(){
    for ( var key in this.children ) {
        return this.children[key].uuid;
    }
}
exports.createServer = function(node, port, host, text) {
    text = text || "Hello World";
    var app = express();
    app.listen(port);
    process.node = node;
    app.get('/', function(req, res){
        node.numRequests += 1;
        res.end(text);
    });
};



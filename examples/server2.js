var express = require('express');

var getFirst = function(){
    for ( var key in this.children ) {
        return this.children[key].uuid;
    }
}
exports.createServer = function(node, port, host) {
    var app = express();
    app.listen(port);
    process.node = node;
    app.get('/', function(req, res){
        res.end("hello world");
    });
};



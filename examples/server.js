var express = require('express');

var getFirst = function(){
    for ( var key in this.children ) {
        return this.children[key].uuid;
    }
}
exports.createServer = function(node) {
    var app = express();
    app.listen('8000');
    process.node = node;
    app.get('/', function(req, res){
        var first = getFirst.apply(process.node);
        
        process.node.once('/-res-'+process.node.uuid, function ( response ) {
            res.end(response);
        });

        process.node.out.emit('/-'+first , "Please Handle This");

    });
};



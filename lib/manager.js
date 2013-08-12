function Manager() {
}

Manager.prototype.register = function( node ) {
    this.node = node;
}

Manager.prototype.getFirst = function () {
    var keys = Object.keys(this.node.children);
    return this.node.children[keys[0]];
}

Manager.prototype.getLast = function () {
    var keys = Object.keys(this.node.children);
    return this.node.children[keys[keys.length-1]];
}

Manager.prototype.getBest = function () {
    return this.getLast();
}


module.exports = Manager;
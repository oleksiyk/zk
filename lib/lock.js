"use strict";

var Zookeeper = require('../index')
var ZkError = Zookeeper.Error

var Lock = function(zk, name) {
    this.zk = zk
    this.name = name

    this.path = null

    this.lockNode = this.zk.create('/zk-locks-' + name).catch(function(err) {
        if(err.code !== ZkError.ZNODEEXISTS){
            throw err
        }
    })
}

module.exports = Lock

Lock.prototype.lock = function() {
    var self = this;

    function grabLock () {
        if(self.path === null){ // unlock() was called
            return false
        }

        return self.zk.getChildren('/zk-locks-' + self.name).then(function(reply) {
            if(reply.children.length === 0 || self.path === null){
                return false
            }
            var children = reply.children.sort(), lowest = '/zk-locks-' + self.name + '/' + children[0]
            if(lowest === self.path){ // we got the lock
                return true
            }

            return self.zk.exists(lowest, true).then(function(reply) {
                if(reply.stat === null){
                    return grabLock()
                }
                return reply.watch.then(function() {
                    return grabLock()
                })
            })
        })
    }

    if(self.path){ // lock() called twice
        return grabLock()
    }

    return self.lockNode.then(function() {
        return self.zk.create('/zk-locks-' + self.name + '/lock-', 0, Zookeeper.ZOO_SEQUENCE | Zookeeper.ZOO_EPHEMERAL).then(function(_path) {
            self.path = _path
            return grabLock()
        })
    })
}

Lock.prototype.unlock = function() {
    var self = this;
    return self.zk.delete(self.path).then(function() {
        self.path = null
    })
}

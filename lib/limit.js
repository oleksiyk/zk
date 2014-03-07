"use strict";

var Zookeeper = require('../index')
var ZkError   = Zookeeper.Error
var path      = require('path')

var Limit = function(zk, name) {
    this.zk = zk
    this.name = name

    this.path = null

    this.lockNode = this.zk.create('/zk-limits-' + name).catch(function(err) {
        if(err.code !== ZkError.ZNODEEXISTS){
            throw err
        }
    })
}

module.exports = Limit

Limit.prototype.limit = function(limit, f) {
    var self = this;

    function grabLock () {
        // 2. Call getChildren( ) on the lock node without setting the watch flag (this is important to avoid the herd effect).
        return self.zk.getChildren('/zk-limits-' + self.name).then(function(reply) {
            var children = reply.children.sort(), ind = children.indexOf(path.basename(self.path))

            console.log(self.name, children.length, ind)

            if(ind === -1){
                throw new Error(self.name + ': ' + self.path + ' is not in the children list')
            }

            // 3. if our index is less than limit, exit the protocol (do the task)
            if(ind < limit){
                return
            }

            // 4. The client calls exists( ) with the watch flag set on the path in the lock directory with the next lowest sequence number.
            return self.zk.exists('/zk-limits-' + self.name + '/' + children[ind - 1], true).then(function(reply) {
                // 5. if exists( ) returns false, go to step 2.
                // Otherwise, wait for a notification for the pathname from the previous step before going to step 2.
                if(reply.stat === null){
                    return grabLock()
                }
                return reply.watch.then(function() {
                    return grabLock()
                })
            })
        })
    }

    return self.lockNode.then(function() {
        // 1. Call create( ) with a pathname of "_locknode_/limit-" and the sequence and ephemeral flags set.
        return self.zk.create('/zk-limits-' + self.name + '/limit-', 0, Zookeeper.ZOO_SEQUENCE | Zookeeper.ZOO_EPHEMERAL).then(function(_path) {
            self.path = _path
            return grabLock()
        })
        .then(f)
        .finally(function() {
            return self.zk.delete(self.path, -1).then(function() {
                self.path = null
            })
        })
    })
}


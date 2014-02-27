"use strict";

var Zookeeper = require('../index')
var ZkError = Zookeeper.Error

var _ = require('lodash')

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

/**
 * http://zookeeper.apache.org/doc/r3.4.5/recipes.html#sc_recipes_Locks
 */

Lock.prototype.lock = function() {
    var self = this;

    function grabLock () {
        if(self.path === null){
            throw new Error(self.name + ': unlock() was called while waiting')
        }

        // 2. Call getChildren( ) on the lock node without setting the watch flag (this is important to avoid the herd effect).
        return self.zk.getChildren('/zk-locks-' + self.name).then(function(reply) {
            var children = reply.children.sort(), ind = _.findIndex(children, function(c) {
                return '/zk-locks-' + self.name + '/' + c === self.path
            })

            if(ind === -1){
                throw new Error(self.name + ': ' + self.path + ' is not in the children list')
            }

            // 3. If the pathname created in step 1 has the lowest sequence number suffix, the client has the lock and the client exits the protocol.
            if(ind === 0){ // we got the lock
                return
            }

            // 4. The client calls exists( ) with the watch flag set on the path in the lock directory with the next lowest sequence number.
            return self.zk.exists('/zk-locks-' + self.name + '/' + children[ind - 1], true).then(function(reply) {
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

    if(self.path){ // lock() called twice
        return grabLock()
    }

    return self.lockNode.then(function() {
        // 1. Call create( ) with a pathname of "_locknode_/lock-" and the sequence and ephemeral flags set.
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

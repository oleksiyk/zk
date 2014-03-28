"use strict";

var Zookeeper = require('../index')
var ZkError   = Zookeeper.Error
var path      = require('path')

/**
 * http://zookeeper.apache.org/doc/r3.4.5/recipes.html#sc_recipes_Locks
 */

var Lock = function(zk, name, limit) {
    this.zk = zk
    this.name = name
    this.limit = limit || 1

    this.path = null
}

module.exports = Lock

Lock.prototype.lock = function(f) {
    var self = this;

    function grabLock () {
        // 2. Call getChildren( ) on the lock node without setting the watch flag (this is important to avoid the herd effect).
        return self.zk.getChildren('/zk-locks-' + self.name).then(function(reply) {
            var children = reply.children.sort(), ind = children.indexOf(path.basename(self.path))

            if(ind === -1){
                throw new Error(self.name + ': ' + self.path + ' is not in the children list')
            }

            // 3. If the pathname created in step 1 has the lowest sequence number suffix, the client has the lock and the client exits the protocol.
            if(ind < self.limit){ // we got the lock
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

    return (function _setLockNode(){
        return self.zk.create('/zk-locks-' + self.name, '')
        .catch(function(err) {
            if(err.code !== ZkError.ZNODEEXISTS){
                throw err
            }
            return self.zk.set('/zk-locks-' + self.name, '', -1) // lock node exists, update its version
            .catch(function (err) {
                if(err.code !== ZkError.ZNONODE){
                    throw err
                }
                return _setLockNode()
            })
        })
        .then(function (reply) {
            if(!reply.stat){
                self._version = 0
            } else {
                self._version = reply.stat.version
            }
        })
    })().then(function() {
        // 1. Call create( ) with a pathname of "_locknode_/lock-" and the sequence and ephemeral flags set.
        return self.zk.create('/zk-locks-' + self.name + '/lock-', 0, Zookeeper.ZOO_SEQUENCE | Zookeeper.ZOO_EPHEMERAL).then(function(_path) {
            self.path = _path
            return grabLock()
        })
        .then(f)
        .finally(function() {
            return self.zk.delete(self.path, -1).then(function() {
                self.path = null
                self.zk.delete('/zk-locks-' + self.name, self._version).catch(function () {}) // only the last lock will be able to delete lockNode
            })
        })
    })
}


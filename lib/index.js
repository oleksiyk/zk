"use strict";

var Promise   = require('bluebird');
var _         = require('lodash')
var ZooKeeper = require ("zookeeper");

var ZkError = require('./error');

var Zookeeper = function(options) {
    options = _.partialRight(_.merge, _.defaults)(options || {}, {
        hostname: '127.0.0.1',
        port: 2181,
        timeout: 200000
    })

    this.zk = new ZooKeeper({
        connect: options.hostname + ':' + options.port,
        timeout: options.timeout,
        debug_level: this.ZOO_LOG_LEVEL_WARN,
        host_order_deterministic: false
    });

}

exports = module.exports = Zookeeper;

[
    'state',
    'timeout',
    'client_id',
    'client_password',
    'is_unrecoverable'
].forEach(function(p) {
    Object.defineProperty(Zookeeper.prototype, p, {
        enumerable: true, get: function () {
            return this.zk[p];
        }, set: function (v) {
            this.zk[p] = v;
        }
    });
})

// Node Flags
exports.ZOO_EPHEMERAL = Zookeeper.prototype.ZOO_EPHEMERAL              =  1
exports.ZOO_SEQUENCE  = Zookeeper.prototype.ZOO_SEQUENCE               =  2

// Permissions:
exports.ZOO_PERM_READ   = Zookeeper.prototype.ZOO_PERM_READ              =  1
exports.ZOO_PERM_WRITE  = Zookeeper.prototype.ZOO_PERM_WRITE             =  2
exports.ZOO_PERM_CREATE = Zookeeper.prototype.ZOO_PERM_CREATE            =  4
exports.ZOO_PERM_DELETE = Zookeeper.prototype.ZOO_PERM_DELETE            =  8
exports.ZOO_PERM_ADMIN  = Zookeeper.prototype.ZOO_PERM_ADMIN             =  16
exports.ZOO_PERM_ALL    = Zookeeper.prototype.ZOO_PERM_ALL               =  31

// States:
exports.ZOO_EXPIRED_SESSION_STATE = Zookeeper.prototype.ZOO_EXPIRED_SESSION_STATE  =  -112
exports.ZOO_AUTH_FAILED_STATE     = Zookeeper.prototype.ZOO_AUTH_FAILED_STATE      =  -113
exports.ZOO_CONNECTING_STATE      = Zookeeper.prototype.ZOO_CONNECTING_STATE       =  1
exports.ZOO_ASSOCIATING_STATE     = Zookeeper.prototype.ZOO_ASSOCIATING_STATE      =  2
exports.ZOO_CONNECTED_STATE       = Zookeeper.prototype.ZOO_CONNECTED_STATE        =  3

// Log Levels:
exports.ZOO_LOG_LEVEL_ERROR = Zookeeper.prototype.ZOO_LOG_LEVEL_ERROR        =  1
exports.ZOO_LOG_LEVEL_WARN  = Zookeeper.prototype.ZOO_LOG_LEVEL_WARN         =  2
exports.ZOO_LOG_LEVEL_INFO  = Zookeeper.prototype.ZOO_LOG_LEVEL_INFO         =  3
exports.ZOO_LOG_LEVEL_DEBUG = Zookeeper.prototype.ZOO_LOG_LEVEL_DEBUG        =  4


Zookeeper.prototype.connect = function() {
    var self = this;
    return new Promise(function(resolve, reject) {
        self.zk.connect(function(err) {
            if(err){
                return reject(err)
            }
            resolve(self)
        })
    })
}

Zookeeper.prototype.get = function(path, watch) {
    var self = this;
    return new Promise(function(resolve, reject) {
        self.zk.a_get(path, watch, function(rc, error, stat, data) {
            if(rc !== 0){
                return reject(new ZkError(rc, error))
            }

            resolve({
                stat: stat,
                data: data
            })
        })
    })
}

Zookeeper.prototype.set = function(path, data, version) {
    var self = this;
    return new Promise(function(resolve, reject) {
        self.zk.a_set(path, data, version, function(rc, error, stat) {
            if(rc !== 0){
                return reject(new ZkError(rc, error))
            }
            resolve({
                stat: stat
            })
        })
    })
}

Zookeeper.prototype.create = function(path, data, flags) {
    var self = this;
    return new Promise(function(resolve, reject) {
        self.zk.a_create(path, data, flags, function(rc, error, path) {
            if(rc !== 0){
                return reject(new ZkError(rc, error))
            }
            resolve(path)
        })
    })
}

Zookeeper.prototype.delete = function(path, version) {
    var self = this;
    return new Promise(function(resolve, reject) {
        self.zk.a_delete(path, version, function(rc, error) {
            if(rc !== 0){
                return reject(new ZkError(rc, error))
            }
            resolve()
        })
    })
}

Zookeeper.prototype.close = function() {
    var self = this;
    return new Promise(function(resolve) {
        self.zk.close()
        resolve()
    })
}

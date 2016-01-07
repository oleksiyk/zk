"use strict";

var Promise   = require('bluebird');
var _         = require('lodash');
var NativeZk = require('../node_modules/zookeeper/build/Release/zookeeper.node').ZooKeeper;

var ZkError = require('./error');

var Zookeeper = function(options) {
    var self = this;

    this.options = _.partialRight(_.merge, _.defaults)(options || {}, {
        connect: '127.0.0.1:2181',
        timeout: 200000,
        logLevel: self.ZOO_LOG_LEVEL_WARN
    });

    this.zk = new NativeZk();

    this.zk.emit = function(ev, a1, a2, a3) {
        if(ev === 'connect' || ev === 'close') {
            a1 = self;
        }
        self.emit(ev, a1, a2, a3);
    };
};

require('util').inherits(Zookeeper, require('events').EventEmitter);

exports = module.exports = Zookeeper;

// Node Flags
exports.ZOO_EPHEMERAL = Zookeeper.prototype.ZOO_EPHEMERAL              =  1;
exports.ZOO_SEQUENCE  = Zookeeper.prototype.ZOO_SEQUENCE               =  2;

// Permissions:
exports.ZOO_PERM_READ   = Zookeeper.prototype.ZOO_PERM_READ              =  1;
exports.ZOO_PERM_WRITE  = Zookeeper.prototype.ZOO_PERM_WRITE             =  2;
exports.ZOO_PERM_CREATE = Zookeeper.prototype.ZOO_PERM_CREATE            =  4;
exports.ZOO_PERM_DELETE = Zookeeper.prototype.ZOO_PERM_DELETE            =  8;
exports.ZOO_PERM_ADMIN  = Zookeeper.prototype.ZOO_PERM_ADMIN             =  16;
exports.ZOO_PERM_ALL    = Zookeeper.prototype.ZOO_PERM_ALL               =  31;

// States:
exports.ZOO_EXPIRED_SESSION_STATE = Zookeeper.prototype.ZOO_EXPIRED_SESSION_STATE  =  -112;
exports.ZOO_AUTH_FAILED_STATE     = Zookeeper.prototype.ZOO_AUTH_FAILED_STATE      =  -113;
exports.ZOO_CONNECTING_STATE      = Zookeeper.prototype.ZOO_CONNECTING_STATE       =  1;
exports.ZOO_ASSOCIATING_STATE     = Zookeeper.prototype.ZOO_ASSOCIATING_STATE      =  2;
exports.ZOO_CONNECTED_STATE       = Zookeeper.prototype.ZOO_CONNECTED_STATE        =  3;

var _zkStates = {};
_zkStates[exports.ZOO_EXPIRED_SESSION_STATE] = 'session_expired';
_zkStates[exports.ZOO_AUTH_FAILED_STATE] = 'auth_failed';
_zkStates[exports.ZOO_CONNECTING_STATE] = 'connecting';
_zkStates[exports.ZOO_ASSOCIATING_STATE] = 'associating';
_zkStates[exports.ZOO_CONNECTED_STATE] = 'connected';

// Log Levels:
exports.ZOO_LOG_LEVEL_ERROR = Zookeeper.prototype.ZOO_LOG_LEVEL_ERROR        =  1;
exports.ZOO_LOG_LEVEL_WARN  = Zookeeper.prototype.ZOO_LOG_LEVEL_WARN         =  2;
exports.ZOO_LOG_LEVEL_INFO  = Zookeeper.prototype.ZOO_LOG_LEVEL_INFO         =  3;
exports.ZOO_LOG_LEVEL_DEBUG = Zookeeper.prototype.ZOO_LOG_LEVEL_DEBUG        =  4;

// Watch event types
exports.ZOO_CREATED_EVENT     = Zookeeper.prototype.ZOO_CREATED_EVENT     = 1;
exports.ZOO_DELETED_EVENT     = Zookeeper.prototype.ZOO_DELETED_EVENT     = 2;
exports.ZOO_CHANGED_EVENT     = Zookeeper.prototype.ZOO_CHANGED_EVENT     = 3;
exports.ZOO_CHILD_EVENT       = Zookeeper.prototype.ZOO_CHILD_EVENT       = 4;
exports.ZOO_SESSION_EVENT     = Zookeeper.prototype.ZOO_SESSION_EVENT     = -1;
exports.ZOO_NOTWATCHING_EVENT = Zookeeper.prototype.ZOO_NOTWATCHING_EVENT = -2;

var _zkWatchEventTypes = {};
_zkWatchEventTypes[exports.ZOO_CREATED_EVENT] = 'created';
_zkWatchEventTypes[exports.ZOO_DELETED_EVENT] = 'deleted';
_zkWatchEventTypes[exports.ZOO_CHANGED_EVENT] = 'changed';
_zkWatchEventTypes[exports.ZOO_CHILD_EVENT] = 'child';
_zkWatchEventTypes[exports.ZOO_SESSION_EVENT] = 'session';
_zkWatchEventTypes[exports.ZOO_NOTWATCHING_EVENT] = 'notwatching';

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
});


Zookeeper.prototype.connect = function() {
    var self = this;
    return new Promise(function(resolve, reject) {

        self.once('error', reject);
        self.once('connect', resolve);

        self.zk.init({
            connect: self.options.connect,
            timeout: self.options.timeout,
            debug_level: self.options.logLevel,
            host_order_deterministic: false
        });
    });
};

Zookeeper.prototype.get = function(path, watch) {
    var self = this;
    return new Promise(function(resolve, reject) {
        var ret;
        if(!watch){
            ret = self.zk.a_get(path, null, function(rc, error, stat, data) {
                if(rc !== 0){
                    return reject(new ZkError(rc, error, path));
                }
                resolve({
                    stat: stat,
                    data: data
                });
            });
        } else {
            var resolver = Promise.defer();
            ret = self.zk.aw_get(path, function(type, state, _path) {
                if(_path === path){
                    resolver.resolve({
                        type: _zkWatchEventTypes[type],
                        state: _zkStates[state],
                        path: _path
                    });
                }
            }, function(rc, error, stat, data) {
                if(rc !== 0){
                    resolver.resolve();
                    return reject(new ZkError(rc, error, path));
                }
                resolve({
                    stat: stat,
                    data: data,
                    watch: resolver.promise
                });
            });
        }
        if(ret !== ZkError.ZOK){
            reject(new ZkError(ret));
        }
    });
};

Zookeeper.prototype.exists = function(path, watch) {
    var self = this;
    return new Promise(function(resolve, reject) {
        var ret;
        if (!watch) {
            ret = self.zk.a_exists(path, null, function(rc, error, stat) {
                if (rc !== 0 && rc !== ZkError.ZNONODE) {
                    return reject(new ZkError(rc, error, path));
                }
                resolve({
                    stat: stat
                });
            });
        } else {
            var resolver = Promise.defer();
            ret = self.zk.aw_exists(path, function(type, state, _path) {
                if(_path === path){
                    resolver.resolve({
                        type: _zkWatchEventTypes[type],
                        state: _zkStates[state],
                        path: path
                    });
                }
            }, function(rc, error, stat) {
                if (rc !== 0 && rc !== ZkError.ZNONODE) {
                    resolver.resolve();
                    return reject(new ZkError(rc, error, path));
                }
                resolve({
                    stat: stat,
                    watch: resolver.promise
                });
            });
        }
        if(ret !== ZkError.ZOK){
            reject(new ZkError(ret));
        }
    });
};

Zookeeper.prototype.getChildren = function(path, watch) {
    var self = this;
    return new Promise(function(resolve, reject) {
        var ret;
        if (!watch) {
            ret = self.zk.a_get_children(path, null, function(rc, error, children) {
                if (rc !== 0) {
                    return reject(new ZkError(rc, error, path));
                }
                resolve({
                    children: children
                });
            });
        } else {
            var resolver = Promise.defer();
            ret = self.zk.aw_get_children(path, function(type, state, _path) {
                if(_path === path){
                    resolver.resolve({
                        type: _zkWatchEventTypes[type],
                        state: _zkStates[state],
                        path: path
                    });
                }
            }, function(rc, error, children) {
                if (rc !== 0) {
                    resolver.resolve();
                    return reject(new ZkError(rc, error, path));
                }
                resolve({
                    children: children,
                    watch: resolver.promise
                });
            });
        }
        if(ret !== ZkError.ZOK){
            reject(new ZkError(ret));
        }
    });
};

Zookeeper.prototype.getChildren2 = function(path, watch) {
    var self = this;
    return new Promise(function(resolve, reject) {
        var ret;
        if (!watch) {
            ret = self.zk.a_get_children2(path, null, function(rc, error, children, stat) {
                if (rc !== 0) {
                    return reject(new ZkError(rc, error, path));
                }
                resolve({
                    children: children,
                    stat: stat
                });
            });
        } else {
            var resolver = Promise.defer();
            ret = self.zk.aw_get_children2(path, function(type, state, _path) {
                if(_path === path){
                    resolver.resolve({
                        type: _zkWatchEventTypes[type],
                        state: _zkStates[state],
                        path: path
                    });
                }
            }, function(rc, error, children, stat) {
                if (rc !== 0) {
                    resolver.resolve();
                    return reject(new ZkError(rc, error, path));
                }
                resolve({
                    children: children,
                    stat: stat,
                    watch: resolver.promise
                });
            });
        }
        if(ret !== ZkError.ZOK){
            reject(new ZkError(ret));
        }
    });
};

Zookeeper.prototype.set = function(path, data, version) {
    var self = this;
    return new Promise(function(resolve, reject) {
        var ret = self.zk.a_set(path, data, version, function(rc, error, stat) {
            if(rc !== 0){
                return reject(new ZkError(rc, error, path));
            }
            resolve({
                stat: stat
            });
        });
        if(ret !== ZkError.ZOK){
            reject(new ZkError(ret));
        }
    });
};

Zookeeper.prototype.create = function(path, data, flags) {
    var self = this;
    return new Promise(function(resolve, reject) {
        var ret = self.zk.a_create(path, data, flags, function(rc, error, _path) {
            if(rc !== 0){
                return reject(new ZkError(rc, error, path));
            }
            resolve(_path);
        });
        if(ret !== ZkError.ZOK){
            reject(new ZkError(ret));
        }
    });
};

Zookeeper.prototype.delete = function(path, version) {
    var self = this;
    return new Promise(function(resolve, reject) {
        var ret = self.zk.a_delete_(path, version, function(rc, error) {
            if(rc !== 0){
                return reject(new ZkError(rc, error, path));
            }
            resolve();
        });
        if(ret !== ZkError.ZOK){
            reject(new ZkError(ret));
        }
    });
};

Zookeeper.prototype.close = function() {
    var self = this;
    return new Promise(function(resolve) {
        self.zk.close();
        resolve();
    });
};


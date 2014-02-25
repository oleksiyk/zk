"use strict";

var _ = require('lodash')

var ZkError = function (code, message) {

    Error.call(this);
    Error.captureStackTrace(this, this.constructor); // capture the stack trace: http://code.google.com/p/v8/wiki/JavaScriptStackTraceApi

    this.name = _.findKey(exports, function(v) { return v === code });

    this.code = code;

    this.message = message || 'ZooKeeper Error';
}

ZkError.prototype = Object.create(Error.prototype);
ZkError.prototype.constructor = ZkError;

exports = module.exports = ZkError;

exports.ZSYSTEMERROR               =  -1
exports.ZRUNTIMEINCONSISTENCY      =  -2
exports.ZDATAINCONSISTENCY         =  -3
exports.ZCONNECTIONLOSS            =  -4
exports.ZMARSHALLINGERROR          =  -5
exports.ZUNIMPLEMENTED             =  -6
exports.ZOPERATIONTIMEOUT          =  -7
exports.ZBADARGUMENTS              =  -8
exports.ZINVALIDSTATE              =  -9
exports.ZAPIERROR                  =  -100
exports.ZNONODE                    =  -101
exports.ZNOAUTH                    =  -102
exports.ZBADVERSION                =  -103
exports.ZNOCHILDRENFOREPHEMERALS   =  -108
exports.ZNODEEXISTS                =  -110
exports.ZNOTEMPTY                  =  -111
exports.ZSESSIONEXPIRED            =  -112
exports.ZINVALIDCALLBACK           =  -113
exports.ZINVALIDACL                =  -114
exports.ZAUTHFAILED                =  -115
exports.ZCLOSING                   =  -116
exports.ZNOTHING                   =  -117
exports.ZSESSIONMOVED              =  -118

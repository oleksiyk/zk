"use strict";

var _ = require('lodash')

var ErrorCodes = {
    ZSYSTEMERROR               :  -1,
    ZRUNTIMEINCONSISTENCY      :  -2,
    ZDATAINCONSISTENCY         :  -3,
    ZCONNECTIONLOSS            :  -4,
    ZMARSHALLINGERROR          :  -5,
    ZUNIMPLEMENTED             :  -6,
    ZOPERATIONTIMEOUT          :  -7,
    ZBADARGUMENTS              :  -8,
    ZINVALIDSTATE              :  -9,
    ZAPIERROR                  :  -100,
    ZNONODE                    :  -101,
    ZNOAUTH                    :  -102,
    ZBADVERSION                :  -103,
    ZNOCHILDRENFOREPHEMERALS   :  -108,
    ZNODEEXISTS                :  -110,
    ZNOTEMPTY                  :  -111,
    ZSESSIONEXPIRED            :  -112,
    ZINVALIDCALLBACK           :  -113,
    ZINVALIDACL                :  -114,
    ZAUTHFAILED                :  -115,
    ZCLOSING                   :  -116,
    ZNOTHING                   :  -117,
    ZSESSIONMOVED              :  -118
}

var ZkError = function (code, message) {

    Error.call(this);
    Error.captureStackTrace(this, this.constructor); // capture the stack trace: http://code.google.com/p/v8/wiki/JavaScriptStackTraceApi

    this.name = _.findKey(ErrorCodes, function(v) { return v === code });

    this.code = code;

    this.message = message || 'ZooKeeper Error';
}

ZkError.prototype = Object.create(Error.prototype);
ZkError.prototype.constructor = ZkError;

module.exports = ZkError;

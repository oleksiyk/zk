'use strict';

var _ = require('lodash');

var _messages = {
    '-1'   : 'System error',
    '-2'   : 'A runtime inconsistency was found',
    '-3'   : 'A data inconsistency was found',
    '-4'   : 'Connection to the server has been lost',
    '-5'   : 'Error while marshalling or unmarshalling data',
    '-6'   : 'Operation is unimplemented',
    '-7'   : 'Operation timeout',
    '-8'   : 'Invalid arguments',
    '-9'   : 'Invliad zhandle state',
    '-100' : 'API Error',
    '-101' : 'Node does not exist',
    '-102' : 'Not authenticated',
    '-103' : 'Version conflict',
    '-108' : 'Ephemeral nodes may not have children',
    '-110' : 'The node already exists',
    '-111' : 'The node has children',
    '-112' : 'The session has been expired by the server',
    '-113' : 'Invalid callback specified',
    '-114' : 'Invalid ACL specified',
    '-115' : 'Client authentication failed',
    '-116' : 'ZooKeeper is closing',
    '-117' : '(not error) no server responses to process',
    '-118' : 'session moved to another server, so operation is ignored',
    '-120' : 'No quorum of new config is connected and up-to-date with the leader of last commmitted config - try invoking reconfiguration after new servers are connected and synced',
    '-121' : 'Reconfiguration requested while another reconfiguration is currently in progress. This is currently not supported. Please retry.',
    '-122' : 'Attempt to create ephemeral node on a local session',
};

var ZkError = function (code, message, path) {
    Error.call(this);
    Error.captureStackTrace(this, this.constructor); // capture the stack trace: http://code.google.com/p/v8/wiki/JavaScriptStackTraceApi

    this.name = _.findKey(exports, function (v) { return v === code; }) || 'ZkError';

    this.code = code;
    if (path) {
        this.path = path;
    }

    this.message = _messages[code] || message || 'ZooKeeper Error';
};

ZkError.prototype = Object.create(Error.prototype);
ZkError.prototype.constructor = ZkError;

exports = module.exports = ZkError;

exports.ZOK = 0;
exports.ZSYSTEMERROR = -1;
exports.ZRUNTIMEINCONSISTENCY = -2;
exports.ZDATAINCONSISTENCY = -3;
exports.ZCONNECTIONLOSS = -4;
exports.ZMARSHALLINGERROR = -5;
exports.ZUNIMPLEMENTED = -6;
exports.ZOPERATIONTIMEOUT = -7;
exports.ZBADARGUMENTS = -8;
exports.ZINVALIDSTATE = -9;
exports.ZAPIERROR = -100;
exports.ZNONODE = -101;
exports.ZNOAUTH = -102;
exports.ZBADVERSION = -103;
exports.ZNOCHILDRENFOREPHEMERALS = -108;
exports.ZNODEEXISTS = -110;
exports.ZNOTEMPTY = -111;
exports.ZSESSIONEXPIRED = -112;
exports.ZINVALIDCALLBACK = -113;
exports.ZINVALIDACL = -114;
exports.ZAUTHFAILED = -115;
exports.ZCLOSING = -116;
exports.ZNOTHING = -117;
exports.ZSESSIONMOVED = -118;
exports.ZNEWCONFIGNOQUORUM = -120;
exports.ZRECONFIGINPROGRESS = -121;
exports.ZEPHEMERALONLOCALSESSION = -122;

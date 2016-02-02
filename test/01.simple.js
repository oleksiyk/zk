'use strict';

/* global describe, it, before, after */

var Zookeeper = require('../index');
var ZkError = Zookeeper.Error;

describe('Simple', function () {
    var zk, path;

    before(function () {
        zk = new Zookeeper({
            hostname: '127.0.0.1',
            port: 2181
        });

        return zk.connect();
    });

    after(function () {
        return zk.close();
    });

    it('#client_id', function () {
        zk.should.have.property('client_id').that.is.a('string');
    });

    it('#create()', function () {
        return zk.create('/test-node-', 'value', Zookeeper.ZOO_SEQUENCE | Zookeeper.ZOO_EPHEMERAL).then(function (_path) {
            path = _path;
            path.should.be.a('string').and.contain('/test-node-');
        });
    });

    it('#set()', function () {
        return zk.set(path, 'value2', -1).then(function (reply) {
            reply.should.be.an('object').and.have.property('stat');
            reply.stat.should.be.an('object');
            reply.stat.should.have.property('czxid');
            reply.stat.should.have.property('mzxid');
            reply.stat.should.have.property('ctime').that.is.a('date');
            reply.stat.should.have.property('mtime').that.is.a('date');
            reply.stat.should.have.property('version');
            reply.stat.should.have.property('cversion');
            reply.stat.should.have.property('aversion');
            reply.stat.should.have.property('ephemeralOwner').that.is.eql(zk.client_id);
            reply.stat.should.have.property('dataLength');
            reply.stat.should.have.property('numChildren');
            reply.stat.should.have.property('pzxid');
        });
    });

    it('#get()', function () {
        return zk.get(path).then(function (reply) {
            reply.should.be.an('object');
            reply.should.have.property('stat').that.is.an('object');
            reply.should.have.property('data');
            reply.data.toString().should.be.eql('value2');
        });
    });

    it('#exists()', function () {
        return zk.exists(path).then(function (reply) {
            reply.should.be.an('object');
            reply.should.have.property('stat').that.is.an('object');
        });
    });

    describe('errors', function () {
        it('#get()', function () {
            return zk.get('/abracadabra')
            .then(function () {
                throw new Error('should be rejected');
            })
            .catch(function (err) {
                err.should.be.instanceOf(ZkError);
                err.code.should.be.eql(ZkError.ZNONODE);
            });
        });

        it('#exists()', function () {
            return zk.exists('/abracadabra').then(function (reply) {
                reply.should.have.property('stat').that.is.eql(null);
            });
        });
    });
});

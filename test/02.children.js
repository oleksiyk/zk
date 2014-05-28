"use strict";

/* global describe, it, before, after */

var Zookeeper = require('../index');
var Promise = require('bluebird');

describe('Children', function() {

    var zk, path;

    before(function() {
        zk = new Zookeeper({
            hostname: '127.0.0.1',
            port: 2181
        });

        return zk.connect().then(function() {
            return zk.create('/test-parent-node-', 'value', Zookeeper.ZOO_SEQUENCE).then(function(_path) {
                path = _path;
                return Promise.all([
                    zk.create(path + '/' + 'test-node-', 'value', Zookeeper.ZOO_SEQUENCE | Zookeeper.ZOO_EPHEMERAL),
                    zk.create(path + '/' + 'test-node-', 'value', Zookeeper.ZOO_SEQUENCE | Zookeeper.ZOO_EPHEMERAL)
                ]);
            });
        });
    });

    after(function() {
        return zk.close();
    });

    it('#getChildren() should return children list', function() {
        return zk.getChildren(path).then(function(reply) {
            reply.should.be.an('object');
            reply.should.have.property('children').that.is.an('array');
            reply.children.should.have.length(2);
            reply.children[0].should.be.a('string').and.contain('test-node-');
            reply.children[1].should.be.a('string').and.contain('test-node-');
        });
    });

    it('#getChildren2() should return children list and node stat', function() {
        return zk.getChildren2(path).then(function(reply) {
            reply.should.be.an('object');
            reply.should.have.property('children').that.is.an('array');
            reply.children.should.have.length(2);
            reply.children[0].should.be.a('string').and.contain('test-node-');
            reply.children[1].should.be.a('string').and.contain('test-node-');

            reply.should.have.property('stat');
            reply.stat.should.be.an('object');
            reply.stat.should.have.property('czxid');
            reply.stat.should.have.property('mzxid');
            reply.stat.should.have.property('ctime').that.is.a('date');
            reply.stat.should.have.property('mtime').that.is.a('date');
            reply.stat.should.have.property('version');
            reply.stat.should.have.property('cversion');
            reply.stat.should.have.property('aversion');
            reply.stat.should.have.property('ephemeralOwner');
            reply.stat.should.have.property('dataLength');
            reply.stat.should.have.property('numChildren').that.is.eql(2);
            reply.stat.should.have.property('pzxid');
        });
    });

});

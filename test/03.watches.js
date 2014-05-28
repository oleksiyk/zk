"use strict";

/* global describe, it, before, after */

var Zookeeper = require('../index');
var Promise = require('bluebird');

describe('Watches', function() {

    var zk, path;

    before(function() {
        zk = new Zookeeper({
            hostname: '127.0.0.1',
            port: 2181
        });

        return zk.connect().then(function() {
            return zk.create('/test-node-', 'value', Zookeeper.ZOO_SEQUENCE).then(function(_path) {
                path = _path;
            });
        });
    });

    after(function() {
        return zk.close();
    });

    it('#get() with watch', function() {
        return zk.get(path, true).then(function(reply) {
            Promise.is(reply.watch).should.be.eql(true);

            zk.set(path, 'some value', -1);

            return reply.watch.then(function(event) {
                event.type.should.be.a('string').and.eql('changed');
                event.path.should.be.eql(path);
                event.state.should.be.a('string').and.eql('connected');
            });
        });
    });

    it('#exists() with watch', function() {
        return zk.exists(path, true).then(function(reply) {
            Promise.is(reply.watch).should.be.eql(true);

            zk.set(path, 'some value', -1);

            return reply.watch.then(function(event) {
                event.type.should.be.a('string').and.eql('changed');
                event.path.should.be.eql(path);
                event.state.should.be.a('string').and.eql('connected');
            });
        });
    });


    it('#getChildren() with watch', function() {
        return zk.getChildren(path, true).then(function(reply) {
            Promise.is(reply.watch).should.be.eql(true);

            zk.create(path + '/' + 'test-node-', 'value', Zookeeper.ZOO_SEQUENCE | Zookeeper.ZOO_EPHEMERAL);

            return reply.watch.then(function(event) {
                event.type.should.be.a('string').and.eql('child');
                event.path.should.be.eql(path);
                event.state.should.be.a('string').and.eql('connected');
            });
        });
    });

    it('#getChildren2() with watch', function() {
        return zk.getChildren2(path, true).then(function(reply) {
            Promise.is(reply.watch).should.be.eql(true);

            zk.create(path + '/' + 'test-node-', 'value', Zookeeper.ZOO_SEQUENCE | Zookeeper.ZOO_EPHEMERAL);

            return reply.watch.then(function(event) {
                event.type.should.be.a('string').and.eql('child');
                event.path.should.be.eql(path);
                event.state.should.be.a('string').and.eql('connected');
            });
        });
    });

});

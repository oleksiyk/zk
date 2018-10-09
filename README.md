# Zk

[![Build Status][badge-travis]][travis]
[![david Dependencies][badge-david-deps]][david-deps]
[![david Dev Dependencies][badge-david-dev-deps]][david-dev-deps]
[![license][badge-license]][license]

Zk is a [promised](https://github.com/petkaantonov/bluebird) based [Zookeeper](http://zookeeper.apache.org) client library for Node.
It uses the fork of C binding from [node-zookeeper](https://github.com/yfinkelstein/node-zookeeper) and makes it easier to use.

The following methods are implemented:

* `get`
* `set`
* `create`
* `exists`
* `delete`
* `getChildren`
* `getChildren2`

### Install
```
$ npm install zk
```

### Connection

```javascript
var Zookeeper = require('zk')
var zk = new Zookeeper()

zk.connect().then(function() {
    // zk.create(), zk.set()...
})
```

### Basics
```javascript
zk.create('/test-node-', 'value', Zookeeper.ZOO_SEQUENCE | Zookeeper.ZOO_EPHEMERAL).then(function(_path) {
    // _path is created node path
})
```

```javascript
return zk.set(path, 'value2', -1).then(function(){
    zk.get(path).then(function(reply){
        // reply.stat is node stat object
        // reply.data is node value (Buffer) -> reply.data.toString() will be 'value2'
    })
})
```

### Watches
Watches are implemented as promises conditionaly returned with results:

`get` without watch:

```javascript
zk.get(path).then(function(reply) {
    // reply.stat is node stats
    // reply.data is node value (buffer)
})
```

`get` with watch:

```javascript
return zk.get(path, true).then(function(reply) {
    // reply.stat, reply.data as above
    // reply.watch is a promise
    return reply.watch.then(function(event){
        // event.type: 'child' | 'changed' | 'deleted' ..
        // event.state
        // event.path
    })
})
```

See tests for more

### Locks

```javascript
var Zookeeper = require('zk')
var Lock = Zookeeper.Lock
var zk = new Zookeeper()

// zk.connect() ...

var lock = new Lock(zk, 'lockName')

var promise = lock.lock(function(){
    // we got the lock!
    // ... do something and return a promise
})
```

Function passed to `lock()` should return a promise. That promise will be the return value of `lock()` call

[badge-license]: https://img.shields.io/badge/License-MIT-green.svg
[license]: https://github.com/oleksiyk/zk/blob/master/LICENSE
[badge-travis]: https://api.travis-ci.org/oleksiyk/zk.svg?branch=master
[travis]: https://travis-ci.org/oleksiyk/zk
[badge-coverage]: https://codeclimate.com/github/oleksiyk/zk/badges/coverage.svg
[coverage]: https://codeclimate.com/github/oleksiyk/zk/coverage
[badge-david-deps]: https://david-dm.org/oleksiyk/zk.svg
[david-deps]: https://david-dm.org/oleksiyk/zk
[badge-david-dev-deps]: https://david-dm.org/oleksiyk/zk/dev-status.svg
[david-dev-deps]: https://david-dm.org/oleksiyk/zk#info=devDependencies

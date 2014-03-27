# Zk

[![Build Status](https://travis-ci.org/oleksiyk/zk.png)](https://travis-ci.org/oleksiyk/zk)

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


# License (MIT)

Copyright (c) 2014
 Oleksiy Krivoshey.

Permission is hereby granted, free of charge, to any person
obtaining a copy of this software and associated documentation
files (the "Software"), to deal in the Software without
restriction, including without limitation the rights to use,
copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the
Software is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
OTHER DEALINGS IN THE SOFTWARE.


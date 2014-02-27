# Zookeeper-promised

[![Build Status](https://travis-ci.org/oleksiyk/zookeeper-promised.png)](https://travis-ci.org/oleksiyk/zookeeper-promised)

Zookeeper-promised is a [promised](https://github.com/petkaantonov/bluebird) based client library for Node.
It uses the same C binding from [node-zookeeper](https://github.com/yfinkelstein/node-zookeeper) but makes it easier to use.

The following methods are implemented:

* `get`
* `set`
* `create`
* `exists`
* `delete`
* `getChildren`
* `getChildren2`

### Connection

```javascript
var Zookeeper = require('zookeeper-promised')
var zk = new Zookeeper()

zk.connect().then(function() {
    // zk.create(), zk.set()...
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
var Zookeeper = require('zookeeper-promised')
var Lock = Zookeeper.Lock
var zk = new Zookeeper()

// zk.connect() ...

var lock = new Lock(zk, 'lockName')

lock.lock()
    .then(function(prev){
        // we got the lock!
        // ... do something
    })
    .then(function(){
        // unlock
        return lock.unlock()
    })
```

The `prev` variable returned after `lock()` will indicate if previous lock holder existed normally:
* if `prev` is `undefined` then either there were no previous lock holder or previous lock holder exited abnormally (without calling `unlock()`)
* if `prev` is `true` then previous lock holder has successfully called `unlock()`

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


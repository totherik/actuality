actuality
=========

[![Build Status](https://travis-ci.org/totherik/actuality.svg)](https://travis-ci.org/totherik/actuality)

`actuality` is a npm-compatible module for collecting data on processes,
including http servers.

#### Basic Usage
```javascript
import actuality from 'actuality';
import { EventEmitter } from 'events';

let emitter = new EventEmitter();
emitter.on('report', (type, { ts, data }) => {
    // Will report 'os' and 'process' metrics
    // at a default interval.
});

actuality({ emitter });
```


# API

#### `actuality([options])`
Initialize the default data collectors and begin collecting data. Returns a
function with the signature `function (req, res)` that can optionally be used
to instrument an HTTP server via the `request` handler.
- `options` (Optional, `object`) - An object containing the following
properties:
    - `interval` (Optional, `number`) - The interval at which recurring
    collectors notify of new data. Defaults to 15 seconds.
    - `emitter` - (Optional, `EventEmitter`) The EventEmitter which should
    receive notifications of new data. If this property is omitted `actuality`
    assumes instrumentation will occur via express middleware, in which case
    events are emitted on the express app instance. If no event emitter is
    provided and no express application is used, no data will be accessible
    outside `actuality`.
    - `metrics` - (Optional, `Array`) - The names of the collectors that should
    report data. The available collectors are `'os'`, `'process'`, `'gc'`,
    `'request'`, and `'server'`. Defaults to `['os', 'process', 'server']`.


 A note about metrics: The `'request'` and `'server'` collectors will only
 aggregate and report data when used in conjunction with an HTTP server. Even
 though `'server'` is a default collector, if the instrumentation function that
 is returned from invoking `actuality` is not used, the collector will not be
 initialized and will report no data.

# Events
#### `report`
`function (type, stats) { }`  
When new data of any type is available, a report event is emitted on the
configured event emitter with arguments `type` and `stats`.
- `type` (String) - The name of the metrics collector that produced this data,
e.g. the type of data.
- `stats` (Object) - An object with the structure `{ ts, data }`, containing a
timestamp in milliseconds (`ts`) and the data collected by this particular
collector.

# Collectors
#### os

#### process

#### gc

#### server

#### request


# Examples

#### Standalone
```javascript
import actuality from 'actuality';
import { EventEmitter } from 'events';


let emitter = new EventEmitter();
emitter.on('report', (type, { ts, data }) => {
    console.log(type); // either 'os' or 'process'
    console.log(ts); // timestamp
    console.log(JSON.stringify(data));
});

// Use default metrics `os` and `process`. Even though `server` is a default
// since there is no server, no server-related metrics will be reported.
actuality({ emitter });
```

#### HTTP Server
```javascript
import Http from 'http';
import actuality from 'actuality';
import { EventEmitter } from 'events';


let emitter = new EventEmitter();
emitter.on('report', (type, { ts, data }) => {
    console.log(type); // either 'os', 'process', or 'server'
    console.log(ts); // timestamp
    console.log(JSON.stringify(data));
});


let instrument = actuality({ emitter });

http.createServer((req, res) => {
    instrument(req, res);
    setImmediate(() => {
        res.end('ok');
    });
}).listen(8000);
```


#### Express Application

```javascript
import express from 'express';
import actuality from 'actuality';
import { EventEmitter } from 'events';


let app = express();

app.on('report', (type, { ts, data }) => {
    console.log(type); // either 'os' or 'process'
    console.log(ts); // timestamp
    console.log(JSON.stringify(data));
});

app.use(actuality());
app.get('/', (req, res, next) => {
    res.end('ok');
});

app.listen(8000);
```

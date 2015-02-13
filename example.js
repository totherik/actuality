import http from 'http';
import { EventEmitter } from 'events';
import actuality from './index';

// This cold be an express app, or just another emitter.
let emitter = new EventEmitter();
emitter.on('report', (...args) => {
    console.log(JSON.stringify(args, null, 4));
});


let instrument = actuality({ interval: 10000, emitter, metrics: ['os', 'process', 'server', 'request', 'gc'] });

let server = http.createServer((req, res) => {
    instrument(req, res);
    setImmediate(() => {
        res.end('ok');
    });
});

server.listen(8000);
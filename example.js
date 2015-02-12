import http from 'http';
import { EventEmitter } from 'events';
import actuality from './index';

let emitter = new EventEmitter();
emitter.on('process', (stats) => {
    console.log(stats);
});

let handle = actuality({ interval: 15000, emitter });

let server = http.createServer((req, res) => {
    handle(req, res);
    res.end('ok');
});

server.listen(8000);
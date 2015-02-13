import http from 'http';
import { EventEmitter } from 'events';
import actuality from './index';

let emitter = new EventEmitter();
emitter.on('report', (type, data) => {
    console.log(JSON.stringify(data, null, 4));
});


let instrument = actuality({ interval: 10000, emitter });

let server = http.createServer((req, res) => {
    instrument(req, res);
    res.end('ok');
});

server.listen(8000);
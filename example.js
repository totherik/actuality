import http from 'http';
import { EventEmitter } from 'events';
import actuality from './index';


let emitter = new EventEmitter();
emitter.on('report', (...args) => {
    console.log(JSON.stringify(args, null, 4));
});


let instrument = actuality({ emitter });
let server = http.createServer((req, res) => {
    instrument(req, res);
    setImmediate(() => {
        res.end('ok');
    });
}).listen(8000);

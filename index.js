import { EventEmitter } from 'events';
import OS from './lib/os';
import Server from './lib/server';
import Request from './lib/request';
import Process from './lib/process';
import { once } from './lib/util';


const DEFAULT_INTERVAL = 15 * 1000;
const DEFAULT_METRICS = [ 'os', 'process', 'server' ];


export default function ({ interval = DEFAULT_INTERVAL, emitter = undefined, metrics = DEFAULT_METRICS }) {

    let server, request;
    let sporadic = [];  // Emit whenevs
    let timed = [];     // Emit at a regular interval


    if (metrics.includes('os')) {
        let os = new OS();
        timed.push(emitter => {
            emitter.emit('report', 'os', {
                ts: Date.now(),
                data: os.toJSON()
            });
        });
    }

    if (metrics.includes('process')) {
        let process = new Process(interval);
        timed.push(emitter => {
            emitter.emit('report', 'process', {
                ts: Date.now(),
                data: process.toJSON()
            });
        });
    }

    if (metrics.includes('gc')) {
        // Sideways loading as `gc-stats` is an optional dependency,
        let GCStats = require('gc-stats');
        let gc = new GCStats();
        sporadic.push(emitter => {
            gc.on('stats', data => {
                emitter.emit('report', 'gc', {
                    ts: Date.now(),
                    data
                });
            });
        });
    }

    if (metrics.includes('request')) {
        // NOTE: This has to happen before the `server`
        // data is registered, as `server` borrows
        // some of the data captured by `request`
        request = new Request(true);
        sporadic.push(emitter => {
            request.on('request', data => {
                emitter.emit('report', 'request', {
                    ts: Date.now(),
                    data
                });
            });
        });
    }

    if (metrics.includes('server')) {
        server = new Server(interval);
        request = request || new Request();

        timed.push(emitter => {
            emitter.emit('report', 'server', {
                ts: Date.now(),
                data: {
                    socket: server.toJSON(),
                    requests: request.toJSON()
                }
            });
        });
    }


    // Announce statistics. If no emitter just creates one as a noop.
    let announce = once((emitter = new EventEmitter()) => {

        for (let register of sporadic) {
            register(emitter);
        }

        setInterval(() => {
            for (let announce of timed) {
                announce(emitter);
            }
        }, interval).unref();

    });


    if (emitter) {
        // Optimistically bind the emitter as early
        // as possibly. If one isn't available, wait
        // until first request to (hopefully) bind the
        // app as the emitter.
        announce(emitter);
    }


    return function actuality(req, res, next) {
        // Noop if emitter was provided
        announce(req.app);

        if (server) {
            server.instrument(req, res);
        }

        if (request) {
            request.instrument(req, res);
        }

        next && next();
    };

}
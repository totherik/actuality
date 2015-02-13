import { EventEmitter } from 'events';
import OS from './lib/os';
import Server from './lib/server';
import Request from './lib/request';
import Process from './lib/process';
import { once } from './lib/util';


const DEFAULT_INTERVAL = 15 * 1000;
const DEFAULT_METRICS = [ 'os', 'process', 'server' ];


export default function ({ interval = DEFAULT_INTERVAL, emitter = undefined, metrics = DEFAULT_METRICS }) {

    let sporadic = [];   // Emit whenevs
    let timed = [];      // Emit at a regular interval


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


    // Registers existing collectors and establishes interval for announcing
    // statistics. If no emitter is provided, just creates one as a noop.
    // NOTE: `timed` collectors array can be modified at any time (and is
    // when `server collector is added.)
    let announce = once((emitter = new EventEmitter()) => {

        for (let register of sporadic) {
            register(emitter);
        }

        setInterval(() => {
            for (let announce of timed) {
                announce(emitter);
            }
        }, interval).unref();

        return emitter;
    });


    // Enhances default collectors *if* program is running
    // as an http server.
    let enhance = once(emitter => {
        let request, server;

        // Will return the cached originally provided emitter if
        // one was provided initially, otherwise will return the
        // passed in emitter.
        emitter = announce(emitter);

        // `request` and `server` are handled specially later
        // as this data is only emitted when running as a server.
        if (metrics.includes('request')) {
            // NOTE: This has to happen before the `server`
            // data is registered, as `server` borrows
            // some of the data captured by `request`
            request = new Request(true);
            request.on('request', data => {
                emitter.emit('report', 'request', {
                    ts: Date.now(),
                    data
                });
            });
        }

        if (metrics.includes('server')) {
            // Add to timed data.
            server = new Server(interval, request);
            timed.push(emitter => {
                emitter.emit('report', 'server', {
                    ts: Date.now(),
                    data: server.toJSON()
                });
            });
        }

        return { request, server };
    });


    if (emitter) {
        // Optimistically bind the emitter as early
        // as possibly. If one isn't available, wait
        // until first request to (hopefully) bind the
        // app as the emitter.
        announce(emitter);
    }


    return function actuality(req, res, next) {
        // Defer instrumentation of `request` and `server`
        // until we know we're running in a server environment
        // and/or accepting requests.
        let { server, request } = enhance(req.app);

        if (server) {
            server.instrument(req, res);
        }

        if (request) {
            request.instrument(req, res);
        }

        next && next();
    };

}
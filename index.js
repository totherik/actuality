import { EventEmitter } from 'events';
import OS from './lib/os';
import Server from './lib/server';
import Process from './lib/process';
import { once } from './lib/util';


export default function ({ interval = 15 * 1000, maxEventLoopDelay = 0, emitter = undefined }) {

    // Provides OS-level metrics.
    let os = new OS();

    // Provides process details.
    let process = new Process(interval, maxEventLoopDelay);

    // Provides server/app info such as requests, status codes,
    // open connections, etc.
    let server = new Server(interval);

    // Announce statistics. No emitter just creates
    // one as a noop.
    let announce = once((emitter = new EventEmitter()) => {
        setInterval(() => {

            emitter.emit('report', 'os', os.toJSON());
            emitter.emit('report', 'server', server.toJSON());
            emitter.emit('report', 'process', process.toJSON());

        }, interval).unref();
    });

    return function actuality(req, res, next) {
        let { app } = req;

        announce(emitter || app);
        server.instrument(req, res);

        next && next();
    };

}
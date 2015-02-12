import finished from 'on-finished';
import { EventEmitter } from 'events';
import { once } from './lib/util';
import { Process, OS, Request } from './lib/index';


function range(n) {
    return ((n / 100) | 0) * 100;
}

export default function ({ interval = 5 * 1000, emitter = new EventEmitter() }) {

    // Provides OS-level metrics.
    let os = new OS();

    // Provides process details.
    let process = new Process(interval);

    // Records arbitrary request-related counts.
    let counter = new Request.Counter();

    // Records data such as response times, requests/sec, etc.
    let times = new Request.Timer();

    // Record response times.
    let time = once(server => {
        // Add instrumentation to get response times. There
        // is a caveat that we won't record the very first request,
        // but I'm ok with that tradeoff since we guarantee accurate
        // request times due to not relying on middleware ordering.
        server.on('request', (_, res) => {
            let timer = times.get('response_time');
            let elapsed = timer.start();
            finished(res, () => elapsed.end());
        });
    });

    // Announce statistics.
    let announce = once(app => {
        setInterval(() => {
            let t = times.toJSON();
            let { histogram: { median: responseTime } } = t['response_time'];
            let { meter: { currentRate: rps } } = t.rps;

            app.emit('process', process.toJSON());
            app.emit('os', os.toJSON());
            app.emit('server', {
                counts: counter.toJSON(),
                responseTime,
                rps
            });

            times.reset();
        }, interval).unref();
    });

    return function (req, res, next) {
        let { app, socket: { server } } = req;

        time(server);
        announce(app || emitter);

        times.get('rps').update();
        counter.inc('total_requests');
        counter.inc('active_requests');

        finished(res, (err) => {
            counter.dec('active_requests');
            if (err) {
                counter.inc('errors');
            }

            let bucket = range(res.statusCode | 0);
            counter.inc(`http_${bucket}`);
        });

        next && next();
    };
}
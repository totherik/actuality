import Measured from 'measured';
import finished from 'on-finished';
import { once } from './lib/util';
import Counter from './lib/counter';


function range(n) {
    return ((n / 100) | 0) * 100;
}

export default function ({ interval = 5 * 1000 }) {
    let app, server;

    // Records response times.
    let timer = new Measured.Timer();
    timer.unref();

    let time = once(server => {
        // Add instrumentation to get response times. There
        // is a caveat that we won't record the very first request,
        // but I'm ok with that tradeoff since we guarantee accurate
        // request times due to not relying on middleware ordering.
        server.on('request', (_, res) => {
            let elapsed = timer.start();
            finished(res, () => elapsed.end());
        });
    });

    // Records requests/second.
    let rps = new Measured.Meter();
    rps.unref();

    // Records arbitrary counts.
    let counter = new Counter();

    return function (req, res, next) {
        app = req.app;

        rps.mark();
        time({ socket: { server } });
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
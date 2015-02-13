import { Timer, Meter } from 'measured';
import finished from 'on-finished';
import { EventEmitter } from 'events';
import { once, range } from './util';
import Counter from './metrics/counter';


export default class Request extends EventEmitter {

    constructor(detailed) {
        this.rps = new Meter();
        this.rps.unref();

        this.timer = new Timer();
        this.timer.unref();

        this.status = new Counter();

        this.time = once(server => {
            let { timer, rps, status } = this;

            server.on('request', (req, res) => {
                let elapsed = timer.start();

                rps.mark();

                finished(res, (err, res) => {
                    if (detailed) {
                        elapsed.once('end', elapsed => {
                            this.emit('request', {
                                url: req.url,
                                method: req.method,
                                status_code: res.statusCode,
                                had_error: !!err,
                                duration: elapsed
                            });
                        });
                    }

                    elapsed.end();

                    let bucket = range(res.statusCode | 0);
                    status.inc(bucket);
                });
            });
        });
    }

    instrument(req, _) {
        this.time(req.socket.server);
    }

    toJSON() {
        let { rps, timer, status } = this;
        let { currentRate: requestsPerSecond } = rps.toJSON();

        let { histogram: { mean: responseTime } } = timer.toJSON();
        timer.reset();

        return {
            'response_time': responseTime,
            'status_code': status.toJSON(),
            rps: requestsPerSecond
        };
    }

}
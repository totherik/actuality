import { Timer, Meter } from 'measured';
import finished from 'on-finished';
import { once, range } from './util';
import Counter from './metrics/counter';


export default class Server {

    constructor(interval) {

        this.timer = new Timer();
        this.timer.unref();

        this.rps = new Meter();
        this.rps.unref();

        this.status = new Counter();
        this.socket = new Counter();

        this.time = once(server => {
            server.on('request', (_, res) => {
                let elapsed = this.timer.start();
                finished(res, () => elapsed.end());
            });
        });

        this.sample = once(server => {
            setInterval(() => {
                server.getConnections((err, count) => {
                    this.socket.reset('active_connections', err ? 0 : count);
                });
            }, interval).unref();
        });
    }

    instrument(req, res) {
        let { time, sample, rps, socket, status } = this;
        let { socket: { server } } = req;

        time(server);
        sample(server);

        rps.mark();
        socket.inc('total_requests');
        socket.inc('active_requests');

        finished(res, (err, res) => {
            socket.dec('active_requests');
            if (err) {
                socket.inc('errors');
            }

            let bucket = range(res.statusCode | 0);
            status.inc(bucket);
        });
    }

    toJSON() {
        let { rps, timer, status, socket } = this;
        let { currentRate: requestsPerSecond } = rps.toJSON();

        let { histogram: { mean: responseTime } } = timer.toJSON();
        timer.reset();

        return {
            'response_time': responseTime,
            'status_code': status.toJSON(),
            socket: socket.toJSON(),
            rps: requestsPerSecond
        };
    }

}

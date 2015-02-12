import finished from 'on-finished';
import { once, range } from './util';
import Timer from './metrics/timer';
import Counter from './metrics/counter';


export default class Server {

    constructor(interval) {
        this.interval = interval;
        this.times = new Timer();
        this.status = new Counter();
        this.socket = new Counter();

        this.time = once(server => {
            server.on('request', (_, res) => {
                let timer = this.times.get('response_time');
                let elapsed = timer.start();
                finished(res, () => elapsed.end());
            });
        });

        this.sample = once(server => {
            setInterval(() => {
                server.getConnections((err, count) => {
                    this.socket.reset('active_connections', err ? 0 : count);
                });
            }, this.interval).unref();
        });
    }

    instrument(req, res) {
        let { time, sample, times, socket, status } = this;
        let { socket: { server } } = req;

        time(server);
        sample(server);

        times.get('rps').update();
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
        let { times, status, socket } = this;
        let { response_time: { histogram: { median: responseTime } }, rps: { meter: { currentRate } } } = times.toJSON();

        times.reset();

        return {
            'status_code': status.toJSON(),
            'server': socket.toJSON(),
            'response_time':  responseTime,
            'rps': currentRate
        };
    }

}

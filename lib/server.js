import { Timer, Meter } from 'measured';
import finished from 'on-finished';
import { once, range } from './util';
import Counter from './metrics/counter';


export default class Server {

    constructor(interval) {
        this.socket = new Counter();
        this.sample = once(server => {
            setInterval(() => {
                server.getConnections((err, count) => {
                    this.socket.reset('active_connections', err ? 0 : count);
                });
            }, interval).unref();
        });
    }

    instrument(req, res) {
        let { sample, socket } = this;
        let { socket: { server } } = req;

        sample(server);

        socket.inc('total_requests');
        socket.inc('active_requests');

        finished(res, (err, _) => {
            socket.dec('active_requests');
            if (err) {
                socket.inc('errors');
            }
        });
    }

    toJSON() {
        return this.socket.toJSON();
    }

}

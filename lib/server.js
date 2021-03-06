import finished from 'on-finished';
import { Timer, Meter } from 'measured';
import Request from './request';
import Counter from './counter';
import { once, range } from './util';


export default class Server {

    constructor(interval, request = new Request()) {
        this.request = request;
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
        let { sample, request, socket } = this;
        let { socket: { server } } = req;

        sample(server);

        request.instrument(req, res);
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
        let { socket, request } = this;
        return {
            socket: socket.toJSON(),
            request: request.toJSON()
        };
    }

}

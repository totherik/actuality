import test from 'tape';
import Http from 'http';
import request from 'supertest';
import { EventEmitter } from 'events';
import actuality from '../';


test('server', t => {

    t.test('report', { timeout: 500 }, t => {
        t.plan(10);

        let emitter = new EventEmitter();
        emitter.once('report', (type, { ts, data }) => {
            t.equal(type, 'server');
            t.ok(!isNaN(ts));
            t.ok(data);

            let { socket, request: req } = data;

            t.ok(!isNaN(socket['total_requests']));
            t.ok(!isNaN(socket['active_requests']));
            //t.ok(!isNaN(socket['active_connections']));
            //t.ok(!isNaN(socket['errors']));

            t.ok(req['response_time'] === null || !isNaN(req['response_time']));
            t.ok(req['status_code']);
            t.ok(!isNaN(req.rps));
            t.end();
        });

        let instrument = actuality({ emitter, interval: 250, metrics: ['server'] });
        let server = Http.createServer((req, res) => {
            instrument(req, res);
            res.statusCode = 200;
            res.end('ok');
        });

        request(server).get('/').end((err, res) => {
            t.error(err);
            t.ok(res);
        });
    });

});
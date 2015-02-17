import test from 'tape';
import Http from 'http';
import request from 'supertest';
import { EventEmitter } from 'events';
import actuality from '../';


test('request', t => {

    t.test('report', { timeout: 500 }, t => {
        t.plan(12);

        let emitter = new EventEmitter();
        emitter.once('report', (type, { ts, data }) => {
            t.equal(type, 'request');
            t.ok(!isNaN(ts));
            t.ok(data);

            let { url, method, 'status_code': statusCode, 'had_error': hadError, duration } = data;
            t.equal(url, '/');
            t.equal(method, 'GET');
            t.equal(statusCode, 200);
            t.equal(hadError, false);
            t.ok(!isNaN(duration));
        });

        let instrument = actuality({ emitter, metrics: ['request'] });
        let server = Http.createServer((req, res) => {
            instrument(req, res);
            res.statusCode = 200;
            res.end('ok');
        });

        request(server).get('/').end((err, res) => {
            t.error(err);
            t.ok(res);
            request(server).get('/').end((err, res) => {
                t.error(err);
                t.ok(res);
                t.end();
            });
        });
    });

});
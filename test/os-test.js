import test from 'tape';
import { EventEmitter } from 'events';
import actuality from '../';


test('gc', t => {

    t.test('report', { timeout: 500 }, t => {
        t.plan(11);

        let emitter = new EventEmitter();
        emitter.once('report', (type, { ts, data }) => {
            t.equal(type, 'os');
            t.ok(!isNaN(ts));
            t.ok(data);

            let { cpuload, uptime, memory } = data;

            t.ok(cpuload);
            let { avg1min: five, avg5min: ten, avg15min: fifteen } = cpuload;
            t.ok(!isNaN(five));
            t.ok(!isNaN(ten));
            t.ok(!isNaN(fifteen));

            t.ok(!isNaN(uptime));
            t.ok(memory);
            t.ok(!isNaN(memory.total));
            t.ok(!isNaN(memory.free));
            t.end();
        });

        actuality({ emitter, interval: 250, metrics: ['os'] });
    });

});
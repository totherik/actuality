import test from 'tape';
import { EventEmitter } from 'events';
import actuality from '../';


test('process', t => {

    t.test('report', { timeout: 500 }, t => {
        t.plan(9);

        let emitter = new EventEmitter();
        emitter.once('report', (type, { ts, data }) => {
            t.equal(type, 'process');
            t.ok(!isNaN(ts));
            t.ok(data);

            let { delay, uptime, memory } = data;
            t.ok(!isNaN(delay));
            t.ok(!isNaN(uptime));
            t.ok(memory);
            t.ok(!isNaN(memory.rss));
            t.ok(!isNaN(memory['heap_total']));
            t.ok(!isNaN(memory['heap_used']));
            t.end();
        });

        actuality({ emitter, interval: 250, metrics: ['process'] });
        global.gc()
    });

});
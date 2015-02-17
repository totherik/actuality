import test from 'tape';
import { EventEmitter } from 'events';
import actuality from '../';


test('gc', t => {

    t.test('report', { timeout: 1000 }, t => {
        t.plan(3);

        let emitter = new EventEmitter();
        emitter.once('report', (type, { ts, data }) => {
            t.equal(type, 'gc');
            t.ok(!isNaN(ts));
            t.ok(data);
            t.end();
        });

        actuality({ emitter, metrics: ['gc'] });
        global.gc();
    });

});
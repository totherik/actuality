import test from 'tape';
import { EventEmitter } from 'events';
import actuality from '../';

try {
    require('gc-stats');
} catch (err) {
    console.warn('gc stats not available.');
    return;
}

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
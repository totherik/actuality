import test from 'tape';
import { EventEmitter } from 'events';
import actuality from '../';


test('actuality', t => {

    let emitter = new EventEmitter();
    emitter.on('gc', () => {
        throw new Error ('Unregistered event fired.');
    });

    emitter.on('request', () => {
        throw new Error ('Unregistered event fired.');
    });

    let instrument = null;
    let filter = (emitter, type, fn) => {
        emitter.once('report', function handler(t, s) {
            if (t === type) {
                fn.call(emitter, t, s);
            } else {
                emitter.once('report', handler);
            }
        });
    };

    t.test('factory', t => {
        t.equal(typeof actuality, 'function');
        instrument = actuality({ emitter, interval: 100 });
        t.equal(typeof instrument, 'function');
        t.end();
    });


    t.test('report - process', { timeout: 500 }, t => {
        t.plan(3);

        filter(emitter, 'process', (type, { ts, data }) => {
            t.equal(type, 'process');
            t.ok(!isNaN(ts));
            t.ok(data);
            t.end();
        });
    });


    t.test('report - os', { timeout: 500 }, t => {
        t.plan(3);

        filter(emitter, 'os', (type, { ts, data }) => {
            t.equal(type, 'os');
            t.ok(!isNaN(ts));
            t.ok(data);
            t.end();
        });
    });

});
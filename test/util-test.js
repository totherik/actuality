import test from 'tape'
import { once, range } from '../dist/lib/util.js';


test('util', function (t) {

    t.test('once', (t) => {
        let inc = once((count) => {
            t.ok(!count);
            return count + 1;
        });

        let count = 0;

        count = inc(count);
        t.equal(count, 1);

        count = inc(count);
        t.equal(count, 1);

        t.end();
    });


    t.test('range', (t) => {
        for (let i = 0; i < 4; i++) {
            let expected = i * 100;
            let limit =  expected + 100;
            for (let j = expected; j < limit; j++) {
                let actual = range(j);
                t.equal(expected, actual);
            }
        }
        t.end();
    });

});
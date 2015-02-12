import Measured from 'measured';


const COUNTERS = new WeakMap();

export default class Counter {
    constructor() {
        COUNTERS.set(this, new Map());
    }

    inc(name) {
        let counters = COUNTERS.get(this);

        if (!counters.has(name)) {
            counters.set(name, new Measured.Counter());
        }

        counters.get(name).inc();
    }

    dec(name) {
        let counters = COUNTERS.get(this);
        if (counters.has(name)) {
            counters.get(name).dec();
        }
    }

    reset() {
        let counters = new Map();
        let existing = COUNTERS.get(this);

        for (let [ key ] of existing) {
            counters.set(key, new Measured.Counter());
        }

        COUNTERS.set(this, counters);
    }

    toJSON() {
        let counters = COUNTERS.get(this);
        let counts = {};

        for (let [ key, value ] of counters.entries()) {
            counts[key] = value.toJSON();
        }

        return counts;
    }
}
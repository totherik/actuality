import Measured from 'measured';


const COUNTERS = new WeakMap();

export default class Counter {
    constructor() {
        COUNTERS.set(this, new Map());
    }

    inc(name, ...args) {
        let counters = COUNTERS.get(this);

        if (!counters.has(name)) {
            counters.set(name, new Measured.Counter());
        }

        counters.get(name).inc(...args);
    }

    dec(name, ...args) {
        let counters = COUNTERS.get(this);
        if (counters.has(name)) {
            counters.get(name).dec(...args);
        }
    }

    reset(name, ...args) {
        let existing = COUNTERS.get(this);
        if (name) {
            if (existing.has(name)) {
                existing.get(name).reset(...args);
            } else {
                this.inc(name, ...args);
            }
        } else {
            for (let [ key ] of existing) {
                this.reset(key);
            }
        }
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
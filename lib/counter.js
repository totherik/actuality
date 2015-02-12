import Measured from 'measured';


const DATA = new WeakMap();

export default class Counter {
    constructor() {
        DATA.set(this, new Map());
    }

    inc(name) {
        let counters = DATA.get(this);

        if (!counters.has(name)) {
            counters.set(name, new Measured.Counter());
        }

        counters.get(name).inc();
    }

    dec(name) {
        let counters = DATA.get(this);
        if (counters.has(name)) {
            counters.get(name).dec();
        }
    }

    reset() {
        let counters = new Map();

        let existing = DATA.get(this);
        for (let [ key ] of existing) {
            counters.set(key, new Measured.Counter());
        }

        DATA.set(this, counters);
    }

    toJSON() {
        let counters = DATA.get(this);

        let result = {};
        for (let [ key, value ] of counters.entries()) {
            result[key] = value.toJSON();
        }

        return result;
    }
}
import Measured from 'measured';


const DATA = new WeakMap();

export default class Counter {
    constructor() {
        this.reset();
    }

    inc(name) {
        let counters = DATA.get(this);

        let metric = counters[name];
        if (!metric) {
            metric = counters[name] = new Measured.Counter();
        }

        metric.inc();
    }

    dec(name) {
        let counters = DATA.get(this);
        if (name in counters) {
            counters[name].dec();
        }
    }

    reset() {
        DATA.set(this, Object.create(null));
    }
}
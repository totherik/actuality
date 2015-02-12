import Measured from 'measured';


const TIMERS = new WeakMap();

export default class Timer {
    constructor() {
        TIMERS.set(this, new Map());
    }


    get(name) {
        let timers = TIMERS.get(this);
        if (!timers.has(name)) {
            let timer = new Measured.Timer();
            timer.unref();
            timers.set(name, timer);
        }
        return timers.get(name);
    }

    reset() {
        let timers = new Map();
        let existing = TIMERS.get(this);

        for (let [ key ] of existing) {
            timers.set(key, new Measured.Timer());
        }

        TIMERS.set(this, timers);
    }

    toJSON() {
        let counters = TIMERS.get(this);
        let times = {};

        for (let [ key, value ] of counters.entries()) {
            times[key] = value.toJSON();
        }

        return times;
    }
}
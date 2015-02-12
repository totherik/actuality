import { Histogram, Timer } from 'measured';


export default class Process {

    constructor(interval = 15 * 1000) {
        this.timer = null;
        this.timekeeper = null;
        this.interval = interval;
        this.reset();
    }

    reset() {
        let timekeeper = this.timekeeper = new Timer();
        timekeeper.unref();

        clearInterval(this.timer);
        this.timer = setInterval(() => {

            let stopwatch = timekeeper.start();
            setImmediate(() => {
                stopwatch.end();
            });

        }, this.interval).unref();
    }

    toJSON() {
        let { meter: { currentRate } } = this.timekeeper.toJSON();

        return {
            delay: currentRate,
            uptime: process.uptime(),
            memoryUsage: process.memoryUsage()
        };
    }

}
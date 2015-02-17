import { Timer } from 'measured';


export default class Process {

    constructor(interval = 15 * 1000) {
        this.interval = interval;
        this.timer = new Timer();
        this.timer.unref();
        this.start();
    }

    start() {
        let { interval, timer } = this;

        // Start sampling at the beginning of (hopefully) the next loop. NOTE:
        // using setTimeout purposefully here.
        setTimeout(function sample(interval, timer) {

            let stopwatch = timer.start();
            setImmediate(() => {
                stopwatch.end();
                // Queue timer for next sample.
                setTimeout(sample, interval, ...arguments).unref();
            });

        }, 0, interval, timer).unref();
    }

    toJSON() {
        let { histogram: { mean: delay } } = this.timer.toJSON();
        this.timer.reset();

        let uptime = process.uptime();
        let { rss, heapTotal, heapUsed } = process.memoryUsage();

        return {
            delay,
            uptime,
            memory: {
                rss,
                'heap_total': heapTotal,
                'heap_used': heapUsed
            }
        };
    }

}
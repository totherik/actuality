import { Timer } from 'measured';


export default class Process {

    constructor(interval = 15 * 1000) {
        this.timekeeper = new Timer();

        // Sample at desired interval
        setInterval(() => {
            let stopwatch = this.timekeeper.start();
            setImmediate(() => {
                stopwatch.end();
            });
        }, interval).unref();
    }

    toJSON() {
        let { meter: { currentRate: delay } } = this.timekeeper.toJSON();
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
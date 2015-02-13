import os from 'os';


export default class OS {

    constructor(interval) {
        this.interval = interval;
    }

    toJSON() {
        let [ avg1min, avg5min, avg15min ] = os.loadavg();
        let total = os.totalmem();
        let free = os.freemem();
        let uptime = os.uptime();

        return {
            cpuload: {
                avg1min,
                avg5min,
                avg15min
            },
            memory: {
                total,
                free
            },
            uptime
        };
    }

}
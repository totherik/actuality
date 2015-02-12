import os from 'os';


export default class OS {

    toJSON() {
        return {
            load: os.loadavg(),
            uptime: os.uptime(),
            memory: {
                total: os.totalmem(),
                free: os.freemem()
            }
        };
    }

}
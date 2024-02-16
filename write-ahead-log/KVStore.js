import WriteAheadLog from './WriteAheadLog.js';

class KVStore {

    constructor(logPath) {
        this.kv = new Map();
        this.wal = new WriteAheadLog(logPath);
        this.restoreFromLog();
    }

    restoreFromLog() {
        const logContent = this.wal.getLogContent();
        const logRows = logContent.split('\n');
        for (const row of logRows) {
            if (row.trim() !== '') {
                const [index, timestamp, data] = row.split(';');
                const { key, value } = JSON.parse(data);
                this.kv.set(key, value);
            }
        }
    }

    getMap() {  
        return this.kv;
    }

    get(key) {
        return this.kv.get(key);
    }

    put(key, value) {
        this.wal.writeEntry(key, value);
        this.kv.set(key, value);
    }

}

export default KVStore;





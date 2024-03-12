import WriteAheadLog from './WriteAheadLog.js';

class KVStore {

    constructor(logPath,rotateSize) {
        this.kv = new Map();
        this.wal = new WriteAheadLog(logPath,rotateSize);
        this.wal.maybeRotate();
        this.restoreFromLog();
    }

    restoreFromLog() {
        const logContent = this.wal.getLogContent();
        const logRows = logContent.split('\n');
        for (const row of logRows) {
            if (row.trim() !== '') {
                const [index, timestamp, data] = row.split(';');

                if (data.startsWith('[')) {
                    const map = new Map(JSON.parse(data));
                    for (const [key, value] of map.entries()) {
                        this.kv.set(key, value);
                    }
                } else {
                    const { key, value } = JSON.parse(data);
                    this.kv.set(key, value);
                }
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
        this.wal.maybeRotate();
    }

    putBatch(map) {
        this.wal.writeBatch(map.entries());

        for (const [key, value] of map.entries()) {
            this.kv.set(key, value);
        }
        this.wal.maybeRotate();
    }



}

export default KVStore;




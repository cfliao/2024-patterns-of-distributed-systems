import WriteAheadLog from './WriteAheadLog.js';

class KVStore {

    constructor(logPath) {
        this.kv = new Map();
        this.wal = new WriteAheadLog(logPath);
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

// class WALEntry {
//     constructor(index, data, type, timestamp) {
//         this.index = index;
//         this.data = data;
//         this.type = type;
//         this.timestamp = timestamp;
//     }
// }




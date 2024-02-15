const fs = require('fs');

class KVStore {
    constructor() {
        this.kv = new Map();
        this.logId = 0; // Initialize the log ID
    }

    get(key) {
        return this.kv.get(key);
    }

    put(key, value) {
        this.kv.set(key, value);
    }

    appendLog(key, value) {
        const index = this.logId++;
        const timestamp = new Date().toISOString();
        const logEntry = { index, timestamp, data: { key, value } };
        const logRow = `${index};${timestamp};${JSON.stringify(logEntry)}\n`;

        fs.appendFile('wal.log', logRow, (err) => {
            if (err) {
                console.error('Error writing to WAL log:', err);
            }
        });
    }
}

class WALEntry {
    constructor(index, data, type, timestamp) {
        this.index = index;
        this.data = data;
        this.type = type;
        this.timestamp = timestamp;
    }
}


module.exports = KVStore;


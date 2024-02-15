const fs = require('fs');

class WriteAheadLog {
    constructor() {
    }

    appendLog(key, value) {
        const index = this.getNewestIndex() + 1;
        const timestamp = new Date().toISOString();
        const logEntry = { index, timestamp, data: { key, value } };
        const logRow = `${index};${timestamp};${JSON.stringify(logEntry.data)}\n`;

        fs.appendFile('wal.log', logRow, (err) => {
            if (err) {
                console.error('Error writing to WAL log:', err);
            }
        });
    }

    getNewestIndex() {
        const logContent = fs.readFileSync('wal.log', 'utf8');
        const logRows = logContent.split('\n');
        let newestIndex = -1;

        for (const row of logRows) {
            if (row.trim() !== '') {
                const index = parseInt(row.split(';')[0]);
                if (index > newestIndex) {
                    newestIndex = index;
                }
            }
        }

        return newestIndex;
    }
}

let wal = new WriteAheadLog();
wal.appendLog('name', 'Alice');
console.log(wal.getNewestIndex());



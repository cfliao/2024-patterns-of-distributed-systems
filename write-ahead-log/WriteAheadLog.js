const fs = require('fs');

class WriteAheadLog {
    constructor() {
    }

    appendLog(key, value) {
        const index = this.getNewestIndex() + 1;
        const timestamp = new Date().toISOString();
        const logEntry = { index, timestamp, data: { key, value } };
        const logRow = `${index};${timestamp};${JSON.stringify(logEntry.data)}\n`;

        fs.appendFileSync('wal.log', logRow, 'utf8');
    }

    // this approach can be harmful to performance
    getNewestIndex() {

        if (!fs.existsSync('wal.log')) {
            fs.writeFileSync('wal.log', '');
            return -1; // if no content
        }
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
wal.appendLog('name', 'Bob');




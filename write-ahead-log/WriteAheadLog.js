import fs from 'node:fs';


class WriteAheadLog {
    constructor(logPath) {
        this.logPath = logPath;
    }

    writeEntry(key, value) {
        const index = this.getNewestIndex() + 1;
        const timestamp = new Date().toISOString();
        const logEntry = { index, timestamp, data: { key, value } };
        const logRow = `${index};${timestamp};${JSON.stringify(logEntry.data)}\n`;

        fs.appendFileSync(this.logPath, logRow, 'utf8');
    }

    getLogContent() {
        if (!fs.existsSync(this.logPath)) {
            fs.writeFileSync(this.logPath, '');
            return '';
        }
        return fs.readFileSync(this.logPath, 'utf8');
    }

    // this approach can be harmful to performance
    getNewestIndex() {

        const logContent = this.getLogContent();

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

export default WriteAheadLog;





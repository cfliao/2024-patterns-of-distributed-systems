import WriteAheadLog from './WriteAheadLog.js';
import fs from 'node:fs'
import path from 'path'
class KVStore {

    constructor(logDirPath,rotateSize) {
        this.kv = new Map();
        this.logPath = this.findLatestLogFile(logDirPath);
        this.wal = new WriteAheadLog(this.logPath,rotateSize);
        this.wal.maybeRotate();
        this.restoreFromLog();
    }

    findLatestLogFile(dirname) {

        const files = fs.readdirSync(dirname);

        const prefixFiles = files.filter(file => file.startsWith('wal_') && file.endsWith('.log'));
        
        //if there is empty in the LogFile
        if (prefixFiles.length === 0){
            const newLogFile = path.join(dirname, `wal_1.log`);
            fs.writeFileSync(newLogFile, ''); // Create an empty log file
            return newLogFile; // Return the path of the newly created log file
        }

            prefixFiles.sort((a, b) => {
                const indexA = parseInt(a.split('_')[1].split('.')[0]);
                const indexB = parseInt(b.split('_')[1].split('.')[0]);
                return indexB - indexA;
            });

            return path.join(dirname, prefixFiles[0]);
        }

        restoreFromLog(){
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




import fs from 'node:fs';
import path from 'path';


class WriteAheadLog {
    logPrefix;
    logSuffix;
    constructor(logPath,rotateSize){
        this.logPath = logPath;
        this.rotateSize = rotateSize;
        this.logSuffix = '.log';
        this.logPrefix = 'wal';
    }

    writeBatch(entries) {// write single entry for the entire batch
            
        const index = this.getNewestDataIndex() + 1;
        const timestamp = new Date().toISOString();
        const logEntry = { index, timestamp, data: [...entries] };
        const logRow = `${index};${timestamp};${JSON.stringify(logEntry.data)}\n`;
        //const map = new Map(JSON.parse(JSON.stringify(logEntry.data)))
        //console.log(map instanceof Map); 
        fs.appendFileSync(this.logPath, logRow, 'utf8');
    }

    writeEntry(key, value) {
        const index = this.getNewestDataIndex() + 1;
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

    removeLogContent(rowNumber) {
        try {
            const filePath = this.logPath;
            fs.readFile(filePath, 'utf8', (err, data) => {
                if (err) {
                    console.error('Error reading file:', err);
                    return;
                }

                const lines = data.split('\n');
                lines.splice(rowNumber, 1); // Remove the specified line

                const updatedContent = lines.join('\n');

                fs.writeFile(filePath, updatedContent, 'utf8', (err) => {
                    if (err) {
                        console.error('Error writing file:', err);
                        return;
                    }
                    //console.log('Log content removed successfully.');
                });
            });
        } catch (error) {
            console.error('Error removing log content:', error);
        }
    }

    // this approach can be harmful to performance
    getNewestDataIndex() {

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

    /*    The following is Segmented Log implementation    */

    //the variable of the max log line numbers
    getMaxLogLine_Numbers(){
        return this.rotateSize;
    }

    //get the log's file index
    getBaseOffsetFromFileName(filePath) {
        const FileName = path.basename(filePath);
        const NameAndSuffix = FileName.split(this.logSuffix);
        const PrefixAndOffset = NameAndSuffix[0].split('_');

        if(PrefixAndOffset[0] === this.logPrefix)
            return parseInt(PrefixAndOffset[1]);

        return -1;
    }

    //get lastest log file's index
    getNewestSegmentIndex(){
        const directory = path.dirname(this.logPath);

        let SegmentCount = 0;

        fs.readdirSync(directory).forEach(file => {
            if(file.startsWith(this.logPrefix) && file.endsWith(this.logSuffix)){
                let temp = this.getBaseOffsetFromFileName(file);
                if(temp > SegmentCount)
                    SegmentCount = temp;
            } 
        });
        return SegmentCount;
    }

    //create the new log file
    createNewLogFile(){
        const index = this.getNewestSegmentIndex()+1;
        const fileName = `wal_${index}.log`;

        //const dirPath = path.dirname(this.logPath).LogFile;
        const dirPath = path.dirname(this.logPath);

        const filePath = path.join(dirPath, fileName);

        fs.open(filePath, 'w', function(err){
            if(err) throw err;
        });

        return filePath;
    }
    //get the second-to-last log path
    getOldFilePath(){
        
        const oldLogIndex = this.getNewestSegmentIndex();
        const oldFileName = `wal_${oldLogIndex}.log`;
        const dirPath = path.dirname(this.logPath);
        const oldfilePath = path.join(dirPath, oldFileName);
        return oldfilePath;
    }

    maybeRotate(){
        if(this.getNewestDataIndex()>=this.getMaxLogLine_Numbers()){
            //split the log into two parts, [0 to 9 lines] and [the lines after 9th]
            const logContent = this.getLogContent();
            const logRows = logContent.split('\n');
            
            const newFilePath = this.createNewLogFile();
            const oldfilePath = this.getOldFilePath();

            var newIndex = 0;   

            for(let i = this.getMaxLogLine_Numbers(); i<=this.getNewestDataIndex(); i++){
                let row = logRows[i];
                
                if(row.trim()!==' '){

                    //replace the old index with new one
                    let parts = row.split(';');
                    parts[0] = newIndex;
                    row = parts.join(';');
                    row += '\n';
                    
                    fs.appendFileSync(newFilePath, row);
                    newIndex++;
                    
                    this.removeLogContent(i, oldfilePath);
                }
            }
            this.logPath = newFilePath;
        }
    }

}

export default WriteAheadLog;





import fs from 'node:fs'

export function PrintLog(logPath){

    fs.readFile(logPath, 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            return;
        }
        console.log(data);
    });


}

import fs from 'fs';
import { LOGS_URL } from '../../tracker-config.json';

const debugLog: any[] = [];
export const log = (...args: any[]) => debugLog.push(args);

export const writeDebugLog = () => {
  fs.writeFile(
    `${LOGS_URL}/debuglog.json`,
    JSON.stringify(debugLog, null, 2),
    err => { if (err) return console.log(err); }
  );
}

import fs from 'fs';
import xml2js from 'xml2js';

import { LOGS_URL } from '../../tracker-config.json';

import { log, writeDebugLog } from './debugLog';
import { getRunData } from './getRunData';
import { getSaveData } from './getSaveData';

export const fileHandler = (resRef: any) => (path: string) => {
  const res = resRef.current;
  const currentTime = new Date(Date.now()).toISOString();
  log('FS change!', { path, currentTime })
  if (path.includes('.checkpoint') || path.includes('Profiles.') || path.includes('default.records')) {
    log('skipping this file');
    return;
  }
  const xmlString = fs.readFileSync(path, 'utf8');
  xml2js.parseString(xmlString, (error, result) => {
    if (error || !result) {
      log('Error or no result', { error });
      return;
    }

    const saveData = getSaveData(result, currentTime);
    const runData = getRunData(saveData);

    // Writing the run to the file with the name based on the start's timestamp
    if (runData) {
      log('Pushed to client at', new Date(Date.now()).toISOString());
      // Emit an SSE that contains the current 'count' as a string
      res.write(`data: ${JSON.stringify(runData)}\n\n`);

      fs.writeFile(
        `${LOGS_URL}/${runData.startDate}.json`,
        JSON.stringify(runData, null, 2),
        err => { if (err) return console.log(err); }
      );
    }

    writeDebugLog();
  });
};


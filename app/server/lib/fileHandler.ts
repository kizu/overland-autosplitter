import fs from 'fs';
import xml2js from 'xml2js';
import { RunData } from '../../src/lib/types';

import { LOGS_URL } from '../../tracker-config';

import { log as debugLog, writeDebugLog } from './debugLog';
import { getRunData } from './getRunData';
import { getSaveData } from './getSaveData';

export const fileHandler = (handleData: (data: RunData) => void, isDebug?: boolean) => (path: string) => {
  const log = isDebug ? debugLog : console.log;
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
      handleData(runData);

      if (isDebug) {
        fs.writeFile(
          `${LOGS_URL}/${runData.startDate}.json`,
          JSON.stringify(runData, null, 2),
          err => { if (err) return console.log(err); }
        );
      }
    }

    if (isDebug) {
      writeDebugLog();
    }
  });
};


import fs from 'fs';
import xml2js from 'xml2js';
import { SaveData } from '../../src/lib/types';

import { log as debugLog } from './debugLog';
import { getSaveData } from './getSaveData';

export const fileHandler = (handleData: (data: SaveData) => void, isDebug?: boolean) => (path: string) => {
  const log = isDebug ? debugLog : console.log;
  const currentTime = new Date(Date.now()).toISOString();
  if (path.includes('.checkpoint') || path.includes('Profiles.') || path.includes('default.records')) {
    return;
  }
  const xmlString = fs.readFileSync(path, 'utf8');
  xml2js.parseString(xmlString, (error, result) => {
    if (error || !result) {
      log('Error or no result', { error });
      return;
    }

    const saveData = getSaveData(result, currentTime);

    // Writing the run to the file with the name based on the start's timestamp
    if (saveData) {
      // Emit an SSE that contains the current 'count' as a string
      handleData(saveData);
    }

    if (isDebug) {
      log('Pushed to client at', new Date(Date.now()).toISOString());
    }
  });
};


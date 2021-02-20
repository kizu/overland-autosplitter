
import fs from 'fs';
import { RunData } from '../../src/lib/types';
import { LOGS_URL } from '../../tracker-config.json';

export let runData: RunData | undefined;

// Get the last run's info
const pastRuns: string[] = [];
fs.readdirSync(LOGS_URL).forEach((file: string) => {
  if (file.match(/^\d+.json$/)) {
    pastRuns.push(file);
  }
});

if (pastRuns.length) {
  const lastRun = JSON.parse(fs.readFileSync(`${LOGS_URL}/${pastRuns.sort()[pastRuns.length - 1]}`, 'utf8'));
  runData = lastRun;
}

export const initRun = (newRunData: Omit<RunData, 'events'>) => {
  runData = {
    ...newRunData,
    events: []
  }
}

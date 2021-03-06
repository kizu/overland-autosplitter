import fs from 'fs';
import { LOGS_URL } from '../../tracker-config';

export const getInitialRunData = () => {
  const pastRuns: string[] = [];
  fs.readdirSync(LOGS_URL).forEach((file: string) => {
    if (file.match(/^\d+.json$/)) {
      pastRuns.push(file);
    }
  });
  if (!pastRuns.length) {
    return undefined;
  }
  const lastRun = JSON.parse(fs.readFileSync(`${LOGS_URL}/${pastRuns.sort()[pastRuns.length - 1]}`, 'utf8'));
  return lastRun;
};

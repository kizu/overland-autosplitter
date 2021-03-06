// I'm not a server person, so sorry for the mess here lol.

import fs from 'fs';
import chokidar from 'chokidar';
import { createServer } from 'vite';
import express, { Response } from 'express';
import cors from 'cors';
import { updateRunData, getUpdatedRunInfo } from './lib/updateRunData';
import { getInitialRunData } from './lib/getInitialRunData';
import { writeDebugLog } from './lib/debugLog';

import { FRONT_PORT, API_PORT, SAVES_URL, LOGS_URL } from '../tracker-config';
import { fileHandler } from './lib/fileHandler';
import { RunData, SaveData } from '../src/lib/types';


// Running the vite server to serve the frontend stuff.
// Just the boilerplate from the docs:
// https://vitejs.dev/guide/api-javascript.html#createserver
(async () => {
  const server = await createServer({
    configFile: false,
    root: './app/',
    server: {
      port: FRONT_PORT
    }
  })
  await server.listen()
})();


const resRef: { current?: Response } = {};

const handleSaveData = (saveData: SaveData, prevRunData: { current: RunData }, isDebug: boolean) => {
  const runData = updateRunData(saveData, prevRunData.current);
  if (!runData) {
    return
  }
  const { hasUpdates, firstEventKey } = getUpdatedRunInfo(prevRunData.current, runData);

  prevRunData.current = runData;
  if (!firstEventKey || !hasUpdates) {
    return
  }
  resRef.current?.write(`data: ${JSON.stringify(runData)}\n\n`);
  if (isDebug) {
    fs.writeFile(
      `${LOGS_URL}/${firstEventKey}.json`,
      JSON.stringify(runData, null, 2),
      err => { if (err) return console.log(err); }
    );
  }
  writeDebugLog();
}

async function runSSE() {
  const runData = { current: getInitialRunData() };
  const app = express();
  app.use(cors());
  app.get('/', async function (_, res) {
    resRef.current = res;
    res.set({
      'Cache-Control': 'no-cache',
      'Content-Type': 'text/event-stream',
      'Connection': 'keep-alive'
    });
    res.flushHeaders();

    res.write('retry: 10000\n\n');
    res.write(`data: ${JSON.stringify(runData.current)}\n\n`);

    chokidar.watch(SAVES_URL, { ignoreInitial: true }).on('add', fileHandler(data => handleSaveData(data, runData, true)));
    chokidar.watch(SAVES_URL).on('change', fileHandler(data => handleSaveData(data, runData, true)));
  });

  app.listen(API_PORT, () => console.log(`Overland tracker API is at ${API_PORT}!`));
}

runSSE().catch(err => console.log(err));


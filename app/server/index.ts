// I'm not a server person, so sorry for the mess here lol.

import chokidar from 'chokidar';
import { createServer } from 'vite';
import express, { Response } from 'express';
import cors from 'cors';

import { FRONT_PORT, API_PORT, SAVES_URL } from '../tracker-config';
import { getInitialRunData } from './lib/getRunData';
import { fileHandler } from './lib/fileHandler';


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

async function runSSE() {
  const runData = getInitialRunData();
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
    res.write(`data: ${JSON.stringify(runData)}\n\n`);

    chokidar.watch(SAVES_URL, { ignoreInitial: true }).on('add', fileHandler(data => resRef.current?.write(`data: ${JSON.stringify(data)}\n\n`), true));
    chokidar.watch(SAVES_URL).on('change', fileHandler(data => resRef.current?.write(`data: ${JSON.stringify(data)}\n\n`), true));
  });

  app.listen(API_PORT, () => console.log(`Overland tracker API is at ${API_PORT}!`));
}

runSSE().catch(err => console.log(err));


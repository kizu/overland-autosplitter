// I'm not a server person, so sorry for the mess here lol.

import * as fs from 'fs';
import * as chokidar from 'chokidar';
import * as xml2js from 'xml2js';
import * as JSPath from 'jspath';
import { default as ticksToDate } from 'ticks-to-date';
import { createServer } from 'vite';
import express from 'express';
import cors from 'cors';

import { RunStats } from '../src/lib/types';

// For now these live here, later could be moved to a config file.
import config from '../tracker-config.json';
const { FRONT_PORT, API_PORT, SAVES_URL, LOGS_URL } = config;

// Running the API server and a watcher itself that would look at the overland save files.


// options

const debugLog: any[] = [];

let run: RunStats = {} as RunStats;
let events: any[] = []; // use a hash by the initial party survivor probs?

// Get the last run's info
const pastRuns: string[] = [];
fs.readdirSync(LOGS_URL).forEach((file: string) => {
  if (file.match(/^\d+.json$/)) {
    pastRuns.push(file);
  }
});

if (pastRuns.length) {
  const lastRun = JSON.parse(fs.readFileSync(`${LOGS_URL}/${pastRuns.sort()[pastRuns.length - 1]}`, 'utf8'));
  run = lastRun.run;
  events = lastRun.events;
}

const resetRun = () => {
  run = {} as RunStats;
  events = [];
};

const getNode = (result: any, path: string) => {
  // we need any here as the type definition is wrong to say it returns an array,
  // while in reality it can be a single item when there is [] in the path.
  const node = JSPath.apply(`..*{.$.${path}}[0]`, result) as any;
  if (node) {
    if (node['_']) {
      return JSON.parse(node['_']);
    } else {
      return node;
    }
  }

  return {};
}

const log = (...args: any[]) => debugLog.push(args);

const fileHandler = (resRef: any) => (path: string) => {
  const res = resRef.current;
  const currentTime = new Date(Date.now()).toISOString();
  log('FS change!', { path, currentTime })
  if (path.includes('.checkpoint') || path.includes('Profiles.')) {
    log('skipping this file');
    return;
  }
  const xmlString = fs.readFileSync(path, 'utf8');
  xml2js.parseString(xmlString, (error, result) => {
    if (error || !result) {
      log('Error or no result', { error, xmlString });
      return;
    }

    // Getting all the data needed from the save file
    const { filename, buildNumber, lastSavedTimeStamp } =
      getNode(result, 'class === "SaveFileComponent"');
    const { distanceIndex, distanceDriven, biomeName } =
      getNode(result, 'class === "MapComponent"');
    const { turn } = getNode(result, 'class === "TurnComponent"');
    const { scene, maps, achievements, ...settings } =
      getNode(result, 'class === "GameComponent"');
    const { dayChunks } = getNode(result, 'class === "TimeOfDayComponent"')
    const { iconPath } = getNode(result, 'class === "LevelInfoComponent"')
    // `on` can be used to diff between the initial level and restart
    const { on } =
      getNode(getNode(result, 'name === "survivors"'), 'class === "VehicleComponent"')
    const BeachFireBurning = getNode(result, 'name === "BeachFireBurning"')

    // Converting the timestamp from C# ticks to js date
    const timestamp = ticksToDate(lastSavedTimeStamp)?.getTime();
    if (!timestamp) {
      log('Error in converting timestamp', lastSavedTimeStamp);
      return;
    }

    // Getting the previous event and setting the initial type
    const prevEvent = events[events.length - 1] || {};
    let type = 'unknown';

    // The most complex condition is the start one.
    const isStart = (biomeName === 'introduction' ? dayChunks === 0 : dayChunks === 1 && on === false) && distanceDriven === 0 && turn === 0;

    if (isStart) {
      resetRun();
      run.startDate = timestamp;
      run.buildNumber = buildNumber;
      run.settings = settings;
      run.biomeName = biomeName;
      type = 'start';
    }

    if (events.length === 0 && type === 'unknown') {
      type = 'continue';
    }

    if (turn === 0 && type !== 'start') {
      type = 'subSegment start';
    }

    if (turn === 1 && prevEvent.turn !== 1 && type !== 'start') {
      type = 'first turn';
    }

    if (turn >= 1 && prevEvent.turn >= 1 && turn !== prevEvent.turn) {
      type = 'new turn';
    }

    if (prevEvent.scene === 0 && scene !== 0) {
      type = 'map arrival';
    }

    if (!isStart && prevEvent.biomeName && biomeName !== prevEvent.biomeName) {
      type = 'biome transition';
    }
    if (biomeName === 'reef' && iconPath === 'LocCamp' && Object.keys(BeachFireBurning).length) {
      type = 'end';
    }

    // We could at first record the event to a variable,
    // and then _not_ push it if it is very stupid one
    // but that would be a perf optimization,
    // for now we can just push everything I guess

    // basically, when debugging, the unknown is ok to have, otherwise only push non-unknowns, and only save to file in the same condition.

    // Just pushing every event, so we could easily compare with previous ones
    const timeFromLast = timestamp - (prevEvent.timestamp || timestamp);
    const shouldSkip = prevEvent.timestamp && !timeFromLast || filename === 'default.records';
    if (!shouldSkip) {
      events.push({
        type, // detected type of the event
        timestamp, // Always needed
        biomeName, // can be helpful
        iconPath, // location
        turn // changes between turns, 0 at the level init
      })
    } else {
      log('SKIPPED')
    }

    // Writing the run to the file with the name based on the start's timestamp
    if (!shouldSkip && events.length && run.startDate) {

      log('Pushed to client at', new Date(Date.now()).toISOString());
      // Emit an SSE that contains the current 'count' as a string
      res.write(`data: ${JSON.stringify({ run, events })}\n\n`);

      fs.writeFile(
        `${LOGS_URL}/${run.startDate}.json`,
        JSON.stringify({ run, events }, null, 2),
        err => { if (err) return console.log(err); }
      );
    }

    fs.writeFile(
      `${LOGS_URL}/debuglog.json`,
      JSON.stringify(debugLog, null, 2),
      err => { if (err) return console.log(err); }
    );
  });
};


// Running the vite server to serve the frontend stuff.
// Just the boilerplate from the docs:
// https://vitejs.dev/guide/api-javascript.html#createserver
(async () => {
  const server = await createServer({
    configFile: false,
    //@ts-ignore
    root: './',
    server: {
      port: FRONT_PORT
    }
  })
  await server.listen()
})();


const resRef: any = {};

async function runSSE() {
  const app = express();
  app.use(cors());
  app.get('/events', async function (_, res) {
    resRef.current = res;
    res.set({
      'Cache-Control': 'no-cache',
      'Content-Type': 'text/event-stream',
      'Connection': 'keep-alive'
    });
    res.flushHeaders();

    res.write('retry: 10000\n\n');
    res.write(`data: ${JSON.stringify({ run, events })}\n\n`);

    chokidar.watch(SAVES_URL, { ignoreInitial: true }).on('add', fileHandler(resRef));
    chokidar.watch(SAVES_URL).on('change', fileHandler(resRef));
  });

  app.get('/', (_, res) => res.json({ run, events }));
  app.listen(API_PORT, () => console.log(`Overland tracker API is at ${API_PORT}!`));
};

runSSE().catch(err => console.log(err));

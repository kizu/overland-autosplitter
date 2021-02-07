// I'm not a server person, so sorry for the mess here lol.

// For now these live here, later could be moved to a config file.
const FRONT_PORT = 3000;
const API_PORT = 3002;
const SAVES_URL = '/Users/kizu/Library/Application Support/Finji/Overland/gameSaves';
const LOGS_URL = '/Users/kizu/projects/overland-tracker-ui/logs';

// Running the vite server to serve the frontend stuff.
// Just the boilerplate from the docs:
// https://vitejs.dev/guide/api-javascript.html#createserver
const { createServer } = require('vite')
; (async () => {
  const server = await createServer({
    configFile: false,
    root: __dirname,
    server: {
      port: FRONT_PORT
    }
  })
  console.log('???')
  await server.listen()
})();


// Running the API server and a watcher itself that would look at the overland save files.
const fs = require('fs');
const express = require('express');
const cors = require('cors');

const app = express();
const port = 3002;

const chokidar = require('chokidar');
const xml2js = require('xml2js');

const JSPath = require('jspath');

const ticksToDate = require('ticks-to-date');

// options

const debugLog = [];

let run = {};
let events = []; // use a hash by the initial party survivor probs?

const resetRun = () => {
  run = {};
  events = [];
};

const getNode = (result, path) => {
  const node = JSPath.apply(`..*{.$.${path}}[0]`, result);
  if (node) {
    if (node['_']) {
      return JSON.parse(node['_']);
    } else {
      return node;
    }
  }

  return {};
}

const log = (...args) => debugLog.push(args);

chokidar.watch(SAVES_URL).on('change', path => {
  const currentTime = Date.now();
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

    // Converting the timestamp from C# ticks to js date
    const timestamp = ticksToDate(lastSavedTimeStamp).getTime();

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

    if (turn === 1 && prevEvent.turn !== 1) {
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

    // We could at first record the event to a variable,
    // and then _not_ push it if it is very stupid one
    // but that would be a perf optimization,
    // for now we can just push everything I guess

    // basically, when debugging, the unknown is ok to have, otherwise only push non-unknowns, and only save to file in the same condition.

    // Just pushing every event, so we could easily compare with previous ones
    events.push({
      filename, // for debugging only
      type, // detected type of the event
      timestamp, // Always needed
      // these two are not needed in the log, useful for debugging
      timeFromLast: timestamp - (prevEvent.timestamp || timestamp),
      timeFromStart: timestamp - run.startDate,
      scene, // 0 === level, 1 === map
      distanceDriven, // 0 when starging, changing after level
      distanceIndex, // Do we need this?
      biomeName, // can be helpful
      dayChunks, // time of day?
      iconPath, // location
      turn // changes between turns, 0 at the level init
    })

    // Writing the run to the file with the name based on the start's timestamp
    if (events.length && run.startDate) {
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
});

app.use(cors());
app.get('/', (req, res) => res.json({ run, events }));
app.listen(API_PORT, () => console.log(`Overland tracker API is at ${API_PORT}!`));

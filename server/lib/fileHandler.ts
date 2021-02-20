import fs from 'fs';
import xml2js from 'xml2js';
import JSPath from 'jspath';
import { default as ticksToDate } from 'ticks-to-date';

import { LOGS_URL, DEBUG } from '../../tracker-config.json';
import type { EventData, SaveData } from '../../src/lib/types';
import { timeOfDayMap } from '../../src/lib/constants';

import { log, writeDebugLog } from './debugLog';
import { runData, initRun } from './getRunData';
import { time } from 'console';

const getNode = (result: any, path: string, all = false) => {
  // we need any here as the type definition is wrong to say it returns an array,
  // while in reality it can be a single item when there is [] in the path.
  const node = JSPath.apply(`..*{.$.${path}}${all ? '' : '[0]'}`, result) as any;
  if (all ? node.length : node) {
    if (all ? node[0]['_'] : node['_']) {
      return all ? node.map((item: any) => JSON.parse(item['_'])) : JSON.parse(node['_']);
    } else {
      return node;
    }
  }

  return {};
}

/** Getting all the data needed from the save file
 * For now using the jspath, but maybe there is a better way to handle this.
 */
const getSaveData = (result: any, currentTime: string): SaveData | undefined => {
  const { filename, buildNumber, lastSavedTimeStamp } =
    getNode(result, 'class === "SaveFileComponent"');
  const { distanceDriven, biomeName } =
    getNode(result, 'class === "MapComponent"');
  const { turn } = getNode(result, 'class === "TurnComponent"');
  const { scene, maps, achievements, ...settings } =
    getNode(result, 'class === "GameComponent"');
  const { dayChunks } = getNode(result, 'class === "TimeOfDayComponent"')
  const { iconPath } = getNode(result, 'class === "LevelInfoComponent"')
  // `on` can be used to diff between the initial level and restart
  const survivors = getNode(result, 'name === "survivors"');
  const { on } =
    getNode(survivors, 'class === "VehicleComponent"')

  const fuelData: { maxFuel: number, fuel: number }[] | {} = getNode(survivors, 'class === "FuelComponent"', true);

  const BeachFireBurning = getNode(result, 'name === "BeachFireBurning"')
  // level > FuelCan > FuelComponent -> fuel cans
  // what's at gas station?
  // survivors > FuelComponent -> currently

  // Converting the timestamp from C# ticks to js date
  const timestamp = ticksToDate(lastSavedTimeStamp)?.getTime();
  if (!timestamp) {
    log('Error in converting timestamp', lastSavedTimeStamp);
    return;
  }

  // FIXME: in the intro the fuel would be incorrect
  // Also, on the rest stops it is equal to 0
  const fuel = Array.isArray(fuelData) ? fuelData.reduce<number>((acc, { fuel }) => acc + fuel, 0) : 0;

  const timeOfDay = timeOfDayMap[dayChunks % 4];

  const isEnd = biomeName === 'reef' && iconPath === 'LocCamp' && Object.keys(BeachFireBurning).length > 0;

  return {
    currentTime, // just for debugging
    timestamp,
    fuel,
    timeOfDay,
    isEnd,
    on,
    iconPath,
    dayChunks,
    scene,
    settings,
    turn,
    distanceDriven,
    biomeName,
    filename,
    buildNumber
  };
}

const getEventData = (saveData: SaveData): EventData => {
  return {} as EventData;
}

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
    if (!saveData) {
      return;
    }
    log(saveData) //

    const {
      timestamp,
      fuel,
      timeOfDay,
      isEnd,
      on,
      iconPath,
      dayChunks,
      scene,
      settings,
      turn,
      distanceDriven,
      biomeName,
      filename,
      buildNumber
    } = saveData;

    const eventData = getEventData(saveData);

    // Getting the previous event and setting the initial type
    const prevEventData = runData?.events[runData.events.length - 1] || {} as EventData;

    let type: EventData['type'] = 'unknown';

    // The most complex condition is the start one.
    const isAnyStart = distanceDriven === 0 && turn === 0;
    const isIntroStart = biomeName === 'introduction' && dayChunks === 0;
    const isReefStart = biomeName === 'reef' && dayChunks === 1;
    const isOther = biomeName !== 'introduction' && biomeName !== 'reef';
    const isRegularStart = isOther && dayChunks === 1 && on === false;
    const isStart = isAnyStart && (isIntroStart || isReefStart || isRegularStart);

    if (isStart) {
      initRun({
        startDate: timestamp,
        buildNumber,
        settings,
        biomeName
      })
      type = 'start';
    }
    if (!runData) {
      log('No runData found')
      return;
    }
    const events = runData.events;
    if (turn === 0 && !isStart) {
      // The check is weak, as relies only on the proper order of events
      // FIXME: look at the last 'subSegment start' event in the queue
      const allSegmentStarts = events.filter(({ type }) => (type === 'subSegment start' || type === 'start'));
      const { timeOfDay: prevTimeOfDay } = allSegmentStarts[allSegmentStarts.length - 1] || {};
      // Do not ever start the subSegment on the initial zero dist driven
      if (timeOfDay !== prevTimeOfDay && (distanceDriven !== 0 || biomeName === 'reef' || biomeName === 'introduction')) {
        type = 'subSegment start';
      } else {
        if (DEBUG) {
          if (on === true) {
            type = 'subSegment restart';
          } else {
            type = 'walkout';
          }
        }

      }
    }

    // These are not yet used for anything

    if (DEBUG) {
      if (turn === 1 && prevEventData.turn !== 1 && type !== 'start') {
        type = 'first turn';
      }

      if (turn >= 1 && prevEventData.turn >= 1 && turn !== prevEventData.turn) {
        type = 'new turn';
      }
    }

    if (prevEventData.scene === 0 && scene !== 0) {
      type = 'map arrival';
    }

    if (!isStart && prevEventData.biomeName && biomeName !== prevEventData.biomeName) {
      type = 'biome transition';
    }
    if (isEnd) {
      type = 'end';
    }

    // We could at first record the event to a variable,
    // and then _not_ push it if it is very stupid one
    // but that would be a perf optimization,
    // for now we can just push everything I guess

    // basically, when debugging, the unknown is ok to have, otherwise only push non-unknowns, and only save to file in the same condition.

    // Just pushing every event, so we could easily compare with previous ones
    const timeFromLast = timestamp - (prevEventData.timestamp || timestamp);
    const isZeroFromLast = prevEventData.timestamp && !timeFromLast;
    const isUnknown = type === 'unknown' && !DEBUG
    // Do not ever skip when we're at start.
    const shouldSkip = !isStart && (isZeroFromLast || isUnknown);
    const newEvent: EventData = {
      type, // detected type of the event
      timestamp, // Always needed
      biomeName, // can be helpful
      iconPath, // location
      turn, // changes between turns, 0 at the level init
      timeOfDay,
      scene,
      fuel
    }
    if (!shouldSkip) {
      events.push(newEvent);
    } else {
      log('SKIPPED')
    }

    // Writing the run to the file with the name based on the start's timestamp
    if (!shouldSkip && events.length && runData.startDate) {

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


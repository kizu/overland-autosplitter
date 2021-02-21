
import fs from 'fs';
import { LOGS_URL, DEBUG } from '../../tracker-config';
import { log } from './debugLog';
import type { EventData, SaveData, RunData } from '../../src/lib/types';

let runData: RunData | undefined;

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

const initRun = (newRunData: Omit<RunData, 'events'>) => {
  runData = {
    ...newRunData,
    events: []
  }
}

export const getInitialRunData = () => runData;

export const getRunData = (saveData: SaveData | undefined) => {
  if (!saveData) {
    return;
  }
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
    buildNumber
  } = saveData;

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
    return undefined;
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

  if (!shouldSkip && events.length && runData.startDate) {
    return runData;
  }
  return undefined;
}

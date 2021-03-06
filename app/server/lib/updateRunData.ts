
import type { SaveData, RunData, RunSettings, EventSegmentStart, EventSegmentEnd } from '../../src/lib/types';

const getDifficulty = (settings: RunSettings) => {
  if (settings.difficulty === 1) {
    if (settings.touristMode) {
      return 'Tourist';
    } else {
      return 'Any%';
    }
  }

  if (settings.difficulty === 2) {
    return 'Hard';
  }

  if (settings.difficulty === 3) {
    if (settings.alwaysNightMode && settings.extraCreaturesMode && settings.noReviveMode && settings.noStunMode && settings.turnTimerEnabled) {
      return 'Ultimate';
    } else {
      return 'Expert';
    }
  }
}

const getSegmentStartEvent = ({ biomeName, iconPath, timeOfDay }: SaveData): EventSegmentStart => ({
  type: 'segment-start',
  biome: biomeName,
  location: iconPath.replace(/^Loc/, ''),
  timeOfDay
})

const getSegmentEndEvent = ({ biomeName, fuel, turn }: SaveData, isBiomeTransition: boolean) => {
  const event: EventSegmentEnd = {
    type: 'segment-end',
    fuel: fuel || 0,
    turns: turn
  };
  if (isBiomeTransition) {
    event.nextBiome = biomeName;
  }
  return event;
}

export const getUpdatedRunInfo = (prevRunData?: RunData, newRunData?: RunData) => {
  if (!prevRunData || !newRunData) {
    return { hasUpdates: false }
  }
  const prevKeys = Object.keys(prevRunData.events);
  const prevEventsCount = prevKeys.length;
  const prevFirstEventKey = prevKeys[0];

  const newKeys = Object.keys(newRunData.events);
  const eventsCount = newKeys.length;
  const firstEventKey = newKeys[0];

  return {
    firstEventKey,
    hasUpdates: (eventsCount !== prevEventsCount || prevFirstEventKey !== firstEventKey)
  };
}

export const updateRunData = (saveData: SaveData | undefined, prevRunData?: RunData): RunData | undefined => {
  if (!saveData) {
    return prevRunData;
  }

  const {
    timestamp,
    timeOfDay,
    isEnd,
    on,
    dayChunks,
    scene,
    settings,
    turn,
    distanceDriven,
    biomeName,
    buildNumber
  } = saveData;

  // The most complex condition is the start one.
  const isAnyStart = distanceDriven === 0 && turn === 0;
  const isIntroStart = biomeName === 'introduction' && dayChunks === 0;
  const isReefStart = biomeName === 'reef' && dayChunks === 1;
  const isOther = biomeName !== 'introduction' && biomeName !== 'reef';
  const isRegularStart = isOther && dayChunks === 1 && on === false;
  const isStart = isAnyStart && (isIntroStart || isReefStart || isRegularStart);

  // If we don't have any prev data, force start event I guess?
  if (isStart || !prevRunData || Object.keys(prevRunData).length === 0) {
    const event = getSegmentStartEvent(saveData);
    const newRunData: RunData = {
      events: { [timestamp]: event },
      build: buildNumber
    }
    if (settings.allDogsMode) {
      newRunData.isAllDogs = true;
    }
    const difficulty = getDifficulty(settings);
    if (difficulty) {
      newRunData.difficulty = difficulty;
    }
    return newRunData;
  }

  const prevEvents = prevRunData.events;

  // If we encounter the current event's timestamp in the events, skip.
  if (prevEvents[timestamp]) {
    return prevRunData;
  }

  const newEvents = { ...prevEvents };

  const prevEventKeys = Object.keys(prevEvents);
  const lastEvent = prevEvents[prevEventKeys[prevEventKeys.length - 1]];
  const isBiomeTransition = !Object.values(prevEvents).find(
    event => event.type === 'segment-start' && event.biome === biomeName || event.type === 'segment-end' && event.nextBiome === biomeName
  );

  if (turn === 0) {
    const allSegmentStarts = Object.values(prevEvents).filter(({ type }) => (type === 'segment-start'));
    const lastSegment = allSegmentStarts[allSegmentStarts.length - 1] as EventSegmentStart;
    if (!lastSegment) {
      return prevRunData;
    }
    const { timeOfDay: prevTimeOfDay } = lastSegment;
    // Do not ever start the subSegment on the initial zero dist driven
    if (timeOfDay !== prevTimeOfDay && (distanceDriven !== 0 || biomeName === 'reef' || biomeName === 'introduction')) {
      newEvents[timestamp] = getSegmentStartEvent(saveData);
    }
  }
  if (lastEvent.type === 'segment-start' && scene !== 0) {
    newEvents[timestamp] = getSegmentEndEvent(saveData, false);
  }
  if (isBiomeTransition) {
    newEvents[timestamp] = getSegmentEndEvent(saveData, true);
  }
  if (isEnd) {
    newEvents[timestamp] = { type: 'end' };
  }

  return { ...prevRunData, events: newEvents };
};

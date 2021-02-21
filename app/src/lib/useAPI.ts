import React from 'react'
import { useSSE } from 'react-hooks-sse';
import type { RunData, Segment, SubSegmentName } from './types';
import { isElectron, BIOME_NAME_MAP } from './constants';

const biomeNames = Object.values(BIOME_NAME_MAP);

const fillSegments = (segments: Segment[]) => {
  const resultSegments = [...segments];

  const lastSegment = segments[segments.length - 1];
  const subSegments = lastSegment?.subSegments || [];
  const lastSubSegment = subSegments[subSegments.length - 1]?.name;
  const isReef = lastSegment?.name === 'Reef';
  const isIntro = lastSegment?.name === 'Introduction';
  const finalSubSegment = isReef ? 'Camp' : isIntro ? 'Survivor' : 'Roadblock';
  // Adding all the reefs to the Reef.
  if (isReef && subSegments.length < 5) {
    const extraReefs = 5 - subSegments.length;
    for (let index = 0; index < extraReefs; index++) {
      resultSegments[resultSegments.length - 1].subSegments.push({
        name: 'Reef',
        subSegments: []
      })
    }
  }
  // Adding the final “roadblock”/“camp” item
  if ((lastSubSegment || isReef) && lastSubSegment !== finalSubSegment) {
    resultSegments[resultSegments.length - 1].subSegments.push({
      name: isReef ? 'Beach' : finalSubSegment,
      subSegments: []
    })
  } else if (isReef && lastSubSegment === 'Camp') {
    // Ooof, awkwrd, need to find a better way to do this lol
    resultSegments[resultSegments.length - 1].subSegments[resultSegments[resultSegments.length - 1].subSegments.length - 1].name = 'Beach';
  }

  // We discard the potential East Coast IL here for now.
  const isIL = segments[0]?.name !== 'East Coast';
  // Also, if we'd have a way to continue the runs starting not from
  // the East Coast, we could want to have this without a condition.
  if (!isIL) {
    const currentIndex = biomeNames.indexOf(segments[segments.length - 1]?.name);
    const futureSegments = biomeNames.slice(currentIndex + 1);
    futureSegments.forEach(segment => {
      resultSegments.push({
        name: segment,
        subSegments: []
      })
    });
  }
  return resultSegments;
}

const pingServer = new Event('pingServer');

const useSSEdata = () => {
  const runData = useSSE<RunData | undefined>('message', undefined);
  return runData;
}

const useElectronData = () => {
  const [runData, setRunData] = React.useState<RunData>();
  React.useEffect(() => {
    window.addEventListener(
      'sendRunData',
      (e: any) => {
        setRunData({ ...e.detail })
      },
      false
    );
    window.dispatchEvent(pingServer);
  }, []);
  return runData;
}

const useSSEorElectron = isElectron() ? useElectronData : useSSEdata;

export const useAPI = (limit?: number) => {
  const runData = useSSEorElectron();
  const { events: allEvents } = runData || { events: [] };
  const events = React.useMemo(
    () => limit === undefined ? allEvents : allEvents.slice(0, limit),
    [allEvents, limit]
  );

  const [segments, setSegments] = React.useState<Segment[]>([]);
  const [eventsCount, setEventsCount] = React.useState(0);

  const isLoading = !runData || !events;
  const runStart = runData?.startDate;

  // Only update the segments when the new event appears
  React.useEffect(() => {
    if (!isLoading) {
      setEventsCount(allEvents.length)
      const newSegments: Segment[] = [];
      let hasEnded = false;
      events.forEach(({ type, biomeName, timestamp, iconPath, timeOfDay, turn, fuel }) => {
        // Here we can record the number of turns taken for the prev subsegment
        if (type === 'map arrival' || type === 'biome transition') {
          const lastSegment = newSegments[newSegments.length - 1];
          if (lastSegment && lastSegment.subSegments.length) {
            const lastSubSegment = lastSegment.subSegments[lastSegment.subSegments.length - 1];
            lastSubSegment.turns = turn;
            lastSubSegment.fuelEnd = fuel;
          }
        }
        if (type === 'start' || type === 'biome transition') {
          const lastSegment = newSegments[newSegments.length - 1];
          if (type === 'biome transition') {
            lastSegment.end = timestamp;
            // we also end the last subSegment of the prev. segment
            lastSegment.subSegments[lastSegment.subSegments.length - 1].end = timestamp;
          }
          newSegments.push({
            name: BIOME_NAME_MAP[biomeName],
            start: timestamp,
            subSegments: []
          });
        }
        if (type === 'start' || type === 'subSegment start') {
          const lastSegment = newSegments[newSegments.length - 1];
          const isFirstSubSegment = !lastSegment?.subSegments.length;
          if (!isFirstSubSegment) {
            lastSegment.subSegments[lastSegment.subSegments.length - 1].end = timestamp;
          }
          if (lastSegment) {
            lastSegment.subSegments.push(
              {
                name: iconPath.replace(/^Loc/, '') as SubSegmentName,
                // First subSegment's start is the same as its parent
                start: isFirstSubSegment ? lastSegment.start : timestamp,
                isNight: timeOfDay === 'night',
                fuelStart: fuel,
                subSegments: [] // potentially, turns / map transitions?
              }
            );
          }
        }
        if (type === 'end' && !hasEnded) {
          hasEnded = true;
          const lastSegment = newSegments[newSegments.length - 1];
          lastSegment.end = timestamp;
          lastSegment.subSegments[lastSegment.subSegments.length - 1].end = timestamp;
        }
      });
      setSegments(fillSegments(newSegments));
    }
    // We need to depend on runStart here, in order to properly recalc runs
    // with the same count of events and if the isLoading is not changed.
  }, [runStart, isLoading, events?.length]);
  return { runData, segments, eventsCount };
};

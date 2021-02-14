import React from 'react'
import { useSSE } from 'react-hooks-sse';
import type { RunStats, Segment, Event, SubSegmentName } from './types';
import { BIOME_NAME_MAP } from './constants';

const biomeNames = Object.values(BIOME_NAME_MAP);

const fillSegments = (segments: Segment[]) => {
  const resultSegments = [...segments];

  const lastSegment = segments[segments.length - 1];
  const subSegments = lastSegment?.subSegments || [];
  const lastSubSegment = subSegments[subSegments.length - 1]?.name;
  const isReef = lastSegment?.name === 'Reef';
  const finalSubSegment = isReef ? 'Camp' : 'Roadblock';
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
      name: finalSubSegment,
      subSegments: []
    })
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

export const useAPI = (limit?: number) => {
  const { run, events: allEvents } = useSSE('message', {} as { run: RunStats, events: any[] });

  const events = React.useMemo(
    () => limit === undefined ? allEvents : allEvents.slice(0, limit),
    [allEvents, limit]
  );

  const [segments, setSegments] = React.useState<Segment[]>([]);
  const [eventsCount, setEventsCount] = React.useState(0);


  const isLoading = !run || !events;

  // Only update the segments when the new event appears
  React.useEffect(() => {
    if (!isLoading) {
      setEventsCount(allEvents.length)
      const newSegments: Segment[] = [];
      events.forEach(({ type, biomeName, timestamp, iconPath }: Event) => {
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
          const isFirstSubSegment = !lastSegment.subSegments.length;
          if (!isFirstSubSegment) {
            lastSegment.subSegments[lastSegment.subSegments.length - 1].end = timestamp;
          }
          lastSegment.subSegments.push(
            {
              name: iconPath.replace(/^Loc/, '') as SubSegmentName,
              // First subSegment's start is the same as its parent
              start: isFirstSubSegment ? lastSegment.start : timestamp,
              subSegments: [] // potentially, turns / map transitions?
            }
          );
        }
        if (type === 'end') {
          const lastSegment = newSegments[newSegments.length - 1];
          lastSegment.end = timestamp;
          lastSegment.subSegments[lastSegment.subSegments.length - 1].end = timestamp;
        }
      });
      setSegments(fillSegments(newSegments));
    }
  }, [isLoading, events?.length]);

  return { runStats: run, segments, eventsCount };
};

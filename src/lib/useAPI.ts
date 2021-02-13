import React from 'react'
import { useSSE } from 'react-hooks-sse';
import type { RunStats, Segment, Event } from './types';
import { BIOME_NAME_MAP } from './constants';

export const useAPI = () => {
  const { run, events } = useSSE('message', {} as { run: RunStats, events: any });

  const [segments, setSegments] = React.useState<Segment[]>([]);
  const [eventsCount, setEventsCount] = React.useState(0);

  const isLoading = !run || !events;

  // Only update the segments when the new event appears
  React.useEffect(() => {
    if (!isLoading) {
      setEventsCount(events.length)
      const newSegments: Segment[] = [];
      events.forEach(({ filename, type, biomeName, timestamp, iconPath }: Event) => {
        // Move to the events population logic
        if (filename === 'default.records') {
          return;
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
          const isFirstSubSegment = !lastSegment.subSegments.length;
          if (!isFirstSubSegment) {
            lastSegment.subSegments[lastSegment.subSegments.length - 1].end = timestamp;
          }
          lastSegment.subSegments.push(
            {
              name: iconPath.replace(/^Loc/, ''),
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
      setSegments(newSegments);
    }
  }, [isLoading, events?.length]);

  return { runStats: run, segments, eventsCount };
};

import React from 'react'
import { useQuery } from 'react-query'
import type { RunStats, Segment, Event } from '../lib/types';
import { BIOME_NAME_MAP, BiomeName } from '../lib/constants';

interface FetcherProps {
  setRunStats: React.Dispatch<React.SetStateAction<RunStats | undefined>>;
  setSegments: React.Dispatch<React.SetStateAction<Segment[]>>;
  setEventsCount: React.Dispatch<React.SetStateAction<number>>;
}

const getRun = () =>
  fetch('http://localhost:3002/').then(res =>
    res.json()
  );

export const Fetcher = ({ setRunStats, setSegments, setEventsCount }: FetcherProps) => {
  const { isLoading, error, data } = useQuery('run', getRun);

  if (error) {
    console.error(error);
  }

  const { run, events } = data || {};
  const { startDate } = run || {};

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


  // Only update the stats if the startDate is changed
  React.useEffect(() => {
    if (!isLoading) {
      setRunStats(run);
    }
  }, [isLoading, startDate]);

  return null;
  // return <ReactQueryDevtools initialIsOpen={false} />;
}


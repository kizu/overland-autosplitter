import React from 'react'
import { BIOME_NAME_MAP } from './constants';
import type { RunData, Segment, SubSegment, SubSegmentName, Segments } from './types';
import { fillSegments } from './fillSegments';

// do we need to do diff segments based on if it is an IL?
// and probably also still fill the segments in the end.
// and do we need to accept the offsets?
// actually, yes, for diffs we'd need to have proper values already here

interface UseSegments {
  runData?: RunData;
}

export const useSegments = ({ runData }: UseSegments) => React.useMemo(() => {
  const segments: Segments = {}
  if (!runData) {
    return [] as Segment[];
  }

  const timestamps = Object.keys(runData.events);
  let currentSegment: Segment | undefined;
  let currentSubSegment: SubSegment | undefined;
  timestamps.forEach(timestamp => {
    const event = runData.events[timestamp];
    const biomeKey =
      (event.type === 'segment-start' && event.biome)
      || (event.type === 'segment-end' && event.nextBiome)
      || undefined;

    if (biomeKey && !segments[biomeKey]) {
      const segment = {
        name: BIOME_NAME_MAP[biomeKey],
        start: Number(timestamp),
        subSegments: []
      }
      segments[biomeKey] = segment;
      if (currentSegment) {
        currentSegment.end = Number(timestamp);
      }
      currentSegment = segment;
    }

    if (!currentSegment) {
      return;
    }

    if (event.type === 'segment-start') {
      const subSegment: SubSegment = {
        name: event.location as SubSegmentName, // use a wrapper?
        start: currentSegment.subSegments.length ? Number(timestamp) : currentSegment.start,
        isNight: event.timeOfDay === 'night'
      }
      currentSegment.subSegments.push(subSegment)
      if (currentSubSegment) {
        currentSubSegment.end = Number(timestamp);
        currentSubSegment = undefined;
      }
      currentSubSegment = subSegment;
    } else if (currentSubSegment) {
      if (event.type === 'end' || (event.type === 'segment-end' && event.nextBiome)) {
        currentSubSegment.end = Number(timestamp);
        currentSubSegment = undefined;
      }
      // do the fuel/turns stuff?
    }
  });
  return fillSegments(Object.values(segments) as Segment[]);
}, [runData]);

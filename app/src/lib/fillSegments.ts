import type { Segment } from './types';
import { BIOME_NAMES } from './constants';

export const fillSegments = (segments: Segment[]) => {
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
        name: 'Reef'
      })
    }
  }
  // Adding the final “roadblock”/“camp” item
  if ((lastSubSegment || isReef) && lastSubSegment !== finalSubSegment) {
    resultSegments[resultSegments.length - 1].subSegments.push({
      name: isReef ? 'Beach' : finalSubSegment
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
    const currentIndex = BIOME_NAMES.indexOf(segments[segments.length - 1]?.name);
    const futureSegments = BIOME_NAMES.slice(currentIndex + 1);
    futureSegments.forEach(segment => {
      resultSegments.push({
        name: segment,
        subSegments: []
      })
    });
  }
  return resultSegments;
}

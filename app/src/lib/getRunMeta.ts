import { BIOME_NAME_MAP } from './constants';
import type { EventSegmentStart, RunData } from './types';

export const getRunMeta = (runData: RunData | undefined = {} as RunData, isForcedIL: boolean) => {
  if (!runData) {
    return {};
  }
  const { difficulty, isAllDogs } = runData;
  const biomeName = (Object.values((runData?.events || {}))[0] as EventSegmentStart)?.biome;
  const isIL = biomeName !== 'city' || isForcedIL;

  return {
    canBeIL: biomeName === 'city',
    category: !isIL ? difficulty : `${BIOME_NAME_MAP[biomeName]} ${difficulty}`,
    isIL,
    isAllDogs
  };
}

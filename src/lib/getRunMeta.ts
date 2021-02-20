import { BIOME_NAME_MAP } from './constants';
import type { RunData } from './types';

export const getRunMeta = ({ buildNumber, settings, biomeName }: RunData | undefined = {} as RunData, isForcedIL: boolean) => {
  if (!settings) {
    return {};
  }
  let difficulty = 'unknown';

  if (settings.difficulty === 1) {
    if (settings.touristMode) {
      difficulty = 'Tourist';
    } else {
      difficulty = 'Any%';``
    }
  }

  if (settings.difficulty === 2) {
    difficulty = 'Hard';
  }

  if (settings.difficulty === 3) {
    if (settings.alwaysNightMode && settings.extraCreaturesMode && settings.noReviveMode && settings.noStunMode && settings.turnTimerEnabled) {
      difficulty = 'Ultimate';
    } else {
      difficulty = 'Expert';
    }
  }

  const isIL = biomeName !== 'city' || isForcedIL;

  return {
    canBeIL: biomeName === 'city',
    buildNumber,
    category: !isIL ? difficulty : `${BIOME_NAME_MAP[biomeName]} ${difficulty}`,
    isIL,
    isAllDogs: settings.allDogsMode
  };
}

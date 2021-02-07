/* @jsx styled.jsx */

import React from 'react'

import type { RunStats, Segment } from '../lib/types';
import { BIOME_NAME_MAP } from '../lib/constants';
import { Timer } from './Timer';
import { styles } from './RunStatsTable.styles';

import styled from '@reshadow/react'

interface RunStatsTableProps {
  run?: RunStats;
  finalTimeStamp?: number;
  segments: Segment[];
}

const getRunMeta = ({ buildNumber, settings, biomeName }: RunStats, isForcedIL: boolean) => {
  let difficulty = 'unknown';

  if (settings.difficulty === 1) {
    if (settings.touristMode) {
      difficulty = 'Tourist';
    } else {
      difficulty = 'Any%';
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

export const RunStatsTable = ({ run, finalTimeStamp, segments }: RunStatsTableProps) => {
  if (!run || !run.startDate) {
    return null;
  }

  // { buildNumber, category, isIL }

  const [isForcedIL, setIsForcedIL] = React.useState(false);

  const { canBeIL, buildNumber, isIL, category, isAllDogs } = getRunMeta(run, isForcedIL);

  return styled(styles)(<main>
    <h1>Overland <small>build {buildNumber}</small></h1>
    <h2>
      <span>
        {category}
        {' '}
        {canBeIL ? <label><input type="checkbox" checked={isForcedIL} onChange={() => setIsForcedIL(!isForcedIL)} /> IL?</label> : null}
      </span>
      {' '}
      {isAllDogs ? <small>All Dogs!</small> : null} {}
      {' '}
    </h2>
    <ol>
      {
        segments.map(({ name, start, end, subSegments }, index) => {
          const subItems = !(end && !isIL) && subSegments.length > 0 ? subSegments.map(({ name: subName, start: subStart, end: subEnd }, subIndex) => (
            <li key={subIndex}>
              <span>{subName}</span>
              <Timer from={subStart} finalTimeStamp={subEnd || finalTimeStamp} />
            </li>
          )) : null;

          return isIL ? index === 0 ? subItems : null : (
            <li key={index}>
              <span>{name} {end ? <small>— {subSegments.length} stops</small> : null}</span>
              <Timer from={start} finalTimeStamp={end || finalTimeStamp} />
              {subItems ? <ol>{subItems}</ol> : null}
            </li>
            );
          }
        )
      }
    </ol>
    <output>
      { isIL
        ? <Timer isLarge from={run.startDate} finalTimeStamp={segments[0]?.end || finalTimeStamp} />
        : <Timer isLarge from={run.startDate} finalTimeStamp={finalTimeStamp} />
      }
    </output>
  </main>)
};

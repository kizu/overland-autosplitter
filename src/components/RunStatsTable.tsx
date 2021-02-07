/* @jsx styled.jsx */

import React from 'react'

import type { RunStats, Segment } from '../lib/types';
import { BIOME_NAME_MAP } from '../lib/constants';
import { Timer } from './Timer';

import styled, { css } from '@reshadow/react'

interface RunStatsTableProps {
  run?: RunStats;
  finalTimeStamp?: number;
  segments: Segment[];
}

interface Variable {
  label: string;
  value: string;
}

const getCategoryAndVariables = ({ settings, biomeName }: RunStats) => {
  let category = 'unknown';
  let variables: Variable[] = [];

  if (biomeName !== 'city') {
    variables.push({
      label: 'IL',
      value: BIOME_NAME_MAP[biomeName]
    })
  }

  if (settings.allDogsMode) {
    variables.push({ label: 'All Dogs', value: 'yes' });
  }

  if (settings.difficulty === 1) {
    if (settings.touristMode) {
      category = 'Tourist';
    } else {
      category = 'Any%';
    }
  }

  if (settings.difficulty === 2) {
    category = 'Hard';
  }

  if (settings.difficulty === 3) {
    if (settings.alwaysNightMode && settings.extraCreaturesMode && settings.noReviveMode && settings.noStunMode && settings.turnTimerEnabled) {
      category = 'Ultimate';
    } else {
      category = 'Expert';
    }
  }

  // Other variables are not yet displayed, so we're not pushing them

  return [{ label: 'Category', value: category }, ...variables]
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

  return styled`
  h1 {
    /* yay, works! */
    background: pink;
  }
  `(<div>
    <h1>Overland <small>build {buildNumber}</small></h1>
    <h2>
      {category}
      {' '}
      {isAllDogs ? <small>(all dogs)</small> : null} {}
      {' '}
      {canBeIL ? <label><input type="checkbox" checked={isForcedIL} onChange={() => setIsForcedIL(!isForcedIL)} /> IL?</label> : null }
    </h2>
    <ol>
      {
        segments.map(({ name, start, end, subSegments }, index) => {
          const subItems = !(end && !isIL) && subSegments.length > 0 ? subSegments.map(({ name: subName, start: subStart, end: subEnd }, subIndex) => (
            <li key={subIndex}>{subName}: <Timer from={subStart} finalTimeStamp={subEnd || finalTimeStamp} /></li>
          )) : null;

          return isIL ? index === 0 ? subItems : null : (<li key={index}>
            {name}: <Timer from={start} finalTimeStamp={end || finalTimeStamp} />
            {end ? `, stops: ${subSegments.length}` : null}

            {subItems ? <ol>
              {subItems}
            </ol> : null}
          </li>)
        }
        )
      }
    </ol>
    <p>
      Big timer:
      { isIL
        ? <Timer from={run.startDate} finalTimeStamp={segments[0]?.end || finalTimeStamp} />
        : <Timer from={run.startDate} finalTimeStamp={finalTimeStamp} />
      }
      </p>
  </div>)
};

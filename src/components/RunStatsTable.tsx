/* @jsx styled.jsx */

import React from 'react'

import type { RunStats, Segment } from '../lib/types';
import { BIOME_NAME_MAP } from '../lib/constants';
import { Timer } from './Timer';

import styled, { css } from '@reshadow/react'

interface RunStatsTableProps {
  run?: RunStats;
  finalTime?: number;
  segments: Segment[];
}

interface Variable {
  label: string;
  value: string;
}

const getCategoryAndVariables = ({ settings, biomeName }: RunStats) => {
  let category = 'unknown';
  let variables: Variable[] = [];

  // The city IL is not detected automatically, as it is the same for the regular run
  // And we can basically record both the IL for the city and the regular run every time.
  // And later maybe add some euristics like if you skip the whole first biome — ok, it is IL lol.
  if (biomeName !== 'city') {
    variables.push({
      label: 'IL',
      value: BIOME_NAME_MAP[biomeName]
    })
  }

  if (settings.allDogsMode) {
    variables.push({ label: 'All Dogs?', value: 'yes' });
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

export const RunStatsTable = ({ run, finalTime, segments }: RunStatsTableProps) => {
  if (!run || !run.startDate) {
    return null;
  }

  const startDate = new Date(run.startDate).toISOString();

  return styled`
  h1 {
    /* yay, works! */
    background: pink;
  }
  `(<div>
    <h1>Overland build: {run.buildNumber}</h1>
    <h2>Run settings</h2>
    <ul>
      {getCategoryAndVariables(run).map(
        ({ label, value }) => <li key={label}>{label}: {value}</li>
      )}
    </ul>
    <h2>Segments:</h2>
    <ol>
      {
        segments.map(({ name, start, end, subSegments }, index) => (<li key={index}>
          {name}: <Timer from={start} finalTime={end ? end - start : finalTime} />
          {end ? `, stops: ${subSegments.length}` : null}

          {!end && subSegments.length > 0 ? <ol>
              {subSegments.map(({ name: subName, start: subStart, end: subEnd }, subIndex) => (
                <li key={subIndex}>{subName}: <Timer from={subStart} finalTime={subEnd ? subEnd - subStart:  finalTime} /></li>
              )) }
            </ol> : null}

          </li>)
        )
      }
    </ol>
    <p>Big timer: <Timer from={run.startDate} finalTime={finalTime} /></p>
  </div>)
};

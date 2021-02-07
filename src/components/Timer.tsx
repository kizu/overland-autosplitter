/* @jsx styled.jsx */

import React from 'react'
import { useInterval } from '../lib/useInterval'
import styled, { css, use } from '@reshadow/react'

const oneSecond = 1000;
const oneMinute = oneSecond * 60;
const oneHour = oneMinute * 60;

interface TimerProps {
  from: number;
  finalTimeStamp?: number;
  isLarge?: boolean;
}

const styles = css`
  span[use|isLarge] {
    font-size: var(--font-large);
  }

  small {
    font-size: var(--font-regular);
  }
`;

export const Timer = React.memo(({ from, finalTimeStamp, isLarge }: TimerProps) => {
  const [now, setNow] = React.useState(Date.now);
  useInterval(() => setNow(Date.now), finalTimeStamp ? null : 16);

  const diff = (finalTimeStamp || now) - from;

  const hours = Math.floor(diff / oneHour);
  const minutes = Math.floor((diff - hours * oneHour) / oneMinute);
  const seconds = Math.floor((diff - hours * oneHour - minutes * oneMinute) / oneSecond);
  const milliseconds = diff - hours * oneHour - minutes * oneMinute - seconds * oneSecond;
  const hh = `${hours}`.padStart(2, '0');
  const mm = `${minutes}`.padStart(hh !== '00' ? 2 : 1, '0');
  const ss = `${seconds}`.padStart(2, '0');
  // If the time is final, do not round ms, otherwise it is better rounded,
  // so it would look better in the animation.
  const ms = `${milliseconds}`.padStart(3, '0');

  return styled(styles)(<span {...use({ isLarge })}>{hh !== '00' ? `${hh}:` : null}{mm}:{ss}{isLarge ? <small>{`.${ms}`}</small> : `.${ms}`}</span>);
});

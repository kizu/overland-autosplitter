/* @jsx styled.jsx */

import React from 'react'
import { useAnimationFrame } from '../lib/useAnimationFrame'
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
  time {
    /* letter-spacing: 0; */
  }

  time[use|isLarge] {
    font-size: var(--font-large);
    font-weight: var(--weight-black);
  }

  small {
    font-size: var(--font-regular);
    font-weight: var(--weight-normal);
  }
`;

export const Timer = React.memo(({ from, finalTimeStamp, isLarge }: TimerProps) => {
  const [now, setNow] = React.useState(Date.now);
  useAnimationFrame(finalTimeStamp ? null : 16, () => setNow(Date.now));
  const isRunning = !finalTimeStamp;
  const diff = (finalTimeStamp || now) - from;

  const hours = Math.floor(diff / oneHour);
  const minutes = Math.floor((diff - hours * oneHour) / oneMinute);
  const seconds = Math.floor((diff - hours * oneHour - minutes * oneMinute) / oneSecond);
  const milliseconds = diff - hours * oneHour - minutes * oneMinute - seconds * oneSecond;
  const mm = `${minutes}`.padStart(hours ? 2 : 1, '0');
  const ss = `${seconds}`.padStart(minutes ? 2 : 1, '0');
  // If the time is final, do not round ms, otherwise it is better rounded,
  // so it would look better in the animation.
  const ms = `${milliseconds}`.padStart(3, '0');

  const dateTime = `${hours}:${mm}:${ss}.${ms}`;
  const humanReadable = finalTimeStamp ? `${dateTime}, ${new Date(from).toISOString()} — ${new Date(finalTimeStamp).toISOString()}` : '';

  return styled(styles)(
    <time {...use({ isLarge })} dateTime={dateTime} title={isRunning ? '' : humanReadable }>
      {hours ? `${hours}:` : null}
      {minutes || !isRunning ? `${mm}:` : null }
      {ss}
      {isLarge ? <small>.{ms}</small> : isRunning ? `.${ms.substring(0, 1)}` : ''}
    </time>);
});

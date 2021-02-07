import React from 'react'
import { useInterval } from '../hooks/useInterval'

const oneSecond = 1000;
const oneMinute = oneSecond * 60;
const oneHour = oneMinute * 60;

interface TimerProps {
  from: number;
  finalTime?: number;
}

export const Timer = React.memo(({ from, finalTime }: TimerProps) => {
  const [diffTimer, setDiffTimer] = React.useState(() => Date.now() - from);
  useInterval(() => setDiffTimer(Date.now() - from), finalTime ? null : 16);

  const diff = finalTime || diffTimer;

  const hours = Math.floor(diff / oneHour);
  const minutes = Math.floor((diff - hours * oneHour) / oneMinute);
  const seconds = Math.floor((diff - hours * oneHour - minutes * oneMinute) / oneSecond);
  const ms = diff - hours * oneHour - minutes * oneMinute - seconds * oneSecond;
  return <>
    {`${hours}`.padStart(2, '0')}
    :
    {`${minutes}`.padStart(2, '0')}
    :
    {`${seconds}`.padStart(2, '0')}
    .
    {`${Math.floor(ms / 10)}`.padStart(2, '0')}
  </>;
});

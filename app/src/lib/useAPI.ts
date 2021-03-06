import React from 'react'
import { useSSE } from 'react-hooks-sse';
import type { RunData } from './types';
import { isElectron } from './constants';
import { useElectronData } from './useElectronAPI';

const useSSEdata = () => {
  const runData = useSSE<RunData | undefined>('message', undefined);
  return runData;
}

const useSSEorElectron = isElectron() ? () => undefined : useSSEdata;

export const useAPI = () => {
  const latestRunData = useSSEorElectron();
  const [{ runData, ...settings }, setData] = useElectronData();
  React.useEffect(() => {
    if (latestRunData) {
      setData({ runData: latestRunData });
    }
  }, [latestRunData, setData]);

  const runDataRef = React.useRef(runData);
  runDataRef.current = runData;

  return { runData, settings, setData };
};

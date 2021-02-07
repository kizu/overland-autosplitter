import React from 'react'
import { useQuery } from 'react-query'
import type { RunStats } from '../types';

interface FetcherProps {
  setRunStats: React.Dispatch<React.SetStateAction<RunStats | undefined>>;
}

const getRun = () =>
  fetch('http://localhost:3002/').then(res =>
    res.json()
  );

export const Fetcher = ({ setRunStats }: FetcherProps) => {
  const { isLoading, error, data } = useQuery('run', getRun)

  const { run } = data || {};
  const { startDate } = run || {};

  // Only update the stats if the startDate is changed
  React.useEffect(() => {
    if (!isLoading) {
      setRunStats(run);
    }
  }, [isLoading, startDate]);

  return null;
  // return <ReactQueryDevtools initialIsOpen={false} />;
}


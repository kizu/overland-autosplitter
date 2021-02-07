import React from 'react'
import { QueryClient, QueryClientProvider, useQuery } from 'react-query'
import { ReactQueryDevtools } from 'react-query/devtools'

import { Fetcher } from './components/Fetcher';
import { RunStatsTable } from './components/RunStatsTable';
import type { RunStats, Segment } from './lib/types';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchInterval: 100,
    },
  },
})

const AppContent = () => {
  const [finalTimeStamp, setfinalTimeStamp] = React.useState<number>();
  const [runStats, setRunStats] = React.useState<RunStats>();
  const [segments, setSegments] = React.useState<Segment[]>([]);
  const [eventsCount, setEventsCount] = React.useState(0);
  const runIsEnded = segments.length && segments[segments.length - 1].end;
  React.useEffect(() => {
    if (runIsEnded && runStats?.startDate) {
      setfinalTimeStamp(runIsEnded);
    } else if (finalTimeStamp) {
      setfinalTimeStamp(undefined);
    }
  }, [runIsEnded]);
  return (
    <div className="App">
      {
        runStats ? <p>
          <button onClick={() => setfinalTimeStamp(prev => prev || !runStats ? undefined : Date.now())}>{finalTimeStamp ? 'Resume timer' : 'Pause timer'}</button>
          <button onClick={() => {
            setRunStats(undefined);
            setfinalTimeStamp(undefined);
          }}>Reset the run</button>
          <strong> {eventsCount} events</strong>
        </p> : null
      }
      <Fetcher setRunStats={setRunStats} setSegments={setSegments} setEventsCount={setEventsCount} />
      {runStats
        ? <RunStatsTable run={runStats} finalTimeStamp={finalTimeStamp} segments={segments} />
        : <div>Waiting for the run to start…</div>
      }
    </div>
  )
}


function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  )
}

export default App

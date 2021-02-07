import React from 'react'
import { QueryClient, QueryClientProvider, useQuery } from 'react-query'
import { ReactQueryDevtools } from 'react-query/devtools'

import { Fetcher } from './components/Fetcher';
import { RunStatsTable } from './components/RunStatsTable';
import type { RunStats } from './types';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchInterval: 100,
    },
  },
})

const AppContent = () => {
  const [runStats, setRunStats] = React.useState<RunStats>();
  const [finalTime, setfinalTime] = React.useState<number>();
  return (
    <div className="App">
      {
        runStats ? <p>
          <button onClick={() => setfinalTime(prev => prev || !runStats ? undefined : Date.now() - runStats?.startDate)}>{finalTime ? 'Resume timer' : 'Pause timer'}</button>
          <button onClick={() => {
            setRunStats(undefined);
            setfinalTime(undefined);
          }}>Reset the run</button>
        </p> : null
      }
      <Fetcher setRunStats={setRunStats} />
      {runStats
        ? <RunStatsTable run={runStats} finalTime={finalTime} />
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

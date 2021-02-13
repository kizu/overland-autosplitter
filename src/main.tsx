import React from 'react'
import ReactDOM from 'react-dom'
import App from './components/App'
import { QueryClient, QueryClientProvider } from 'react-query'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchInterval: 100,
    },
  },
})

ReactDOM.render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
        <App />
    </QueryClientProvider>
  </React.StrictMode>,
  document.getElementById('root')
)

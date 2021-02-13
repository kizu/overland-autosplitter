import React from 'react'
import ReactDOM from 'react-dom'
import App from './components/App'
import { SSEProvider } from 'react-hooks-sse';

ReactDOM.render(
  <React.StrictMode>
    <SSEProvider endpoint="http://localhost:3002/events">
      <App />
    </SSEProvider>
  </React.StrictMode>,
  document.getElementById('root')
)

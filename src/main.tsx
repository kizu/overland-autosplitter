import React from 'react'
import ReactDOM from 'react-dom'
import App from './components/App'
import { SSEProvider } from 'react-hooks-sse';

const endpoint = `${document.location.origin.replace('3000', '3002')}/events`;

ReactDOM.render(
  <React.StrictMode>
    <SSEProvider endpoint={endpoint}>
      <App />
    </SSEProvider>
  </React.StrictMode>,
  document.getElementById('root')
)

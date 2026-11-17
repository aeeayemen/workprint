import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import '@atlaskit/css-reset';

/**
 * Global Promise Rejection & Message Error Handler
 *
 * Prevents third-party browser extensions (such as password managers, tab coordinators,
 * and Atlassian Rovo helper extensions) from crashing the Custom UI iframe when their
 * internal message-passing calls (e.g., "tabs:outgoing.message.ready" or "Could not establish connection")
 * find no listening receiver in this sandbox.
 */
window.addEventListener('unhandledrejection', (event) => {
  const reasonMessage = event.reason?.message || String(event.reason || '');
  if (
    reasonMessage.includes('tabs:outgoing.message.ready') ||
    reasonMessage.includes('No Listener') ||
    reasonMessage.includes('Could not establish connection') ||
    reasonMessage.includes('The message port closed before a response was received')
  ) {
    // Suppress benign external browser extension communication warnings
    event.preventDefault();
  }
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);



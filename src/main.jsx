import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Debug helper for common "black screen" issues
window.addEventListener('error', (event) => {
  const root = document.getElementById('root');
  if (root) {
    root.innerHTML = `<div style="padding: 20px; color: #ff5555; background: #1a1a1a; font-family: monospace;">
      <h1 style="margin: 0 0 10px 0;">Runtime Error Detected</h1>
      <p style="margin: 0;">${event.error ? event.error.message : event.message}</p>
      <pre style="margin-top: 10px; font-size: 12px; opacity: 0.8;">${event.error ? event.error.stack : ''}</pre>
    </div>`;
  }
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

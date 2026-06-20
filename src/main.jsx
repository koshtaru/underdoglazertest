import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Always start at the top of the page on refresh/initial load instead of
// letting the browser restore the previous scroll position.
if ('scrollRestoration' in window.history) {
  window.history.scrollRestoration = 'manual'
}
// On a plain refresh (no #section anchor in the URL), jump to the top.
if (!window.location.hash) {
  window.scrollTo(0, 0)
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

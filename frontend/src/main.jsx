import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { initSmoothScroll } from './utils/smoothScroll'

// initialize custom smooth scrolling for in-page anchors
if (typeof window !== 'undefined') {
  // more pronounced settle: longer delay and softer final settle
  initSmoothScroll({ duration: 600, overshoot: 0.02, settleDelay: 220, settleDuration: 260 });
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

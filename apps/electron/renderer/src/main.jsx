import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './css/main.css'
import App from './App.jsx'

const API_ORIGIN = (import.meta.env.VITE_API_ORIGIN || 'https://proyecto-almacen.onrender.com').replace(/\/+$/, '')
const LOCAL_API_REGEX = /^https?:\/\/(localhost|127\.0\.0\.1):3000(\/api\/.+)$/i
const originalFetch = window.fetch.bind(window)

window.fetch = (input, init) => {
  const toCloudUrl = (url) => {
    const match = String(url).match(LOCAL_API_REGEX)
    return match ? `${API_ORIGIN}${match[2]}` : url
  }

  if (typeof input === 'string') {
    return originalFetch(toCloudUrl(input), init)
  }

  if (input instanceof Request) {
    const rewrittenUrl = toCloudUrl(input.url)
    if (rewrittenUrl !== input.url) {
      const rewrittenRequest = new Request(rewrittenUrl, input)
      return originalFetch(rewrittenRequest, init)
    }
  }

  return originalFetch(input, init)
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@main/styles/globals.css'
import App from '@main/app/App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

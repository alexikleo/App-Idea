import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, MemoryRouter } from 'react-router-dom'
import '@fontsource-variable/bricolage-grotesque/opsz.css'
import '@fontsource-variable/figtree'
import App from './App.tsx'
import './index.css'
import { AuthProvider } from './lib/auth'
import { initTheme } from './lib/theme'

// The shareable preview build runs inside a host page where the URL can't change.
const Router = import.meta.env.VITE_MEMORY_ROUTER ? MemoryRouter : BrowserRouter

initTheme()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Router basename={import.meta.env.BASE_URL}>
      <AuthProvider>
        <App />
      </AuthProvider>
    </Router>
  </StrictMode>,
)

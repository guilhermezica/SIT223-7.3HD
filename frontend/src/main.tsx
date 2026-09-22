//importing index.css file to apply global styles
import './pages/index.css'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import { BrowserRouter } from 'react-router'
import { StrictMode } from 'react'
import { AuthProvider } from './context/AuthContext.tsx'
import { Toaster } from 'sonner'

// I need to render toaster near the top of the tree so that it doesn't fire into nothing.

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
      <Toaster />
    </BrowserRouter>
  </StrictMode>,
)




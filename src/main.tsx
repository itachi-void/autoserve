import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { AppDataProvider } from './data/AppDataContext'
import { ThemeProvider } from './data/ThemeContext'
import { ToastProvider } from './data/ToastContext'
import { ConfirmProvider } from './data/ConfirmContext'
import { AuthProvider } from './data/AuthContext'
import ToastContainer from './components/ui/ToastContainer'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <AppDataProvider>
            <ConfirmProvider>
              <App />
              <ToastContainer />
            </ConfirmProvider>
          </AppDataProvider>
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  </React.StrictMode>,
)

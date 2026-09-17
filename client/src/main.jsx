import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import { TenantProvider } from './context/TenantContext.jsx';
import { ThemeProvider } from './context/ThemeContext.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { ToastHost } from './components/ui.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <TenantProvider>
          <ThemeProvider>
            <AuthProvider>
              <App />
              <ToastHost />
            </AuthProvider>
          </ThemeProvider>
        </TenantProvider>
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>
);
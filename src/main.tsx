import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { AppErrorBoundary } from './components/ui/AppErrorBoundary';
import { installGlobalErrorReporting } from './lib/clientLog';
import { unlockAudioOnFirstGesture } from './lib/ringtone';

if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (event) => {
    if (
      event.reason &&
      (event.reason.message?.includes('WebSocket') ||
       (typeof event.reason === 'string' && event.reason.includes('WebSocket')))
    ) {
      event.preventDefault();
    }
  });
  installGlobalErrorReporting();
  unlockAudioOnFirstGesture();
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppErrorBoundary>
      <App />
    </AppErrorBoundary>
  </StrictMode>,
);

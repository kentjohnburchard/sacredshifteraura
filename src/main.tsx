import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Initialize core system services
import { GlobalEventHorizon } from './services/GlobalEventHorizon';
import { EventBus } from './services/EventBus';
import { MetricsCollector } from './services/MetricsCollector';
import { SystemIntegrityService } from './services/SystemIntegrityService';

// Pre-initialize singletons
GlobalEventHorizon.getInstance();
EventBus.getInstance();
// Other services are initialized in the App component

// Declare global Supabase client for TypeScript
declare global {
  interface Window {
    supabase: any;
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
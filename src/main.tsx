import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'

import { GlobalErrorBoundary } from './components/GlobalErrorBoundary'

// CRITICAL FIX: Aggressively clear local storage if migration flag is missing
// This ensures users with corrupted state from previous versions get a clean slate
try {
  const MIGRATION_KEY = 'lacqr_v2_migration_complete';
  if (!localStorage.getItem(MIGRATION_KEY)) {
    console.warn("Performing hard reset of local storage for v2 migration...");
    localStorage.clear();
    localStorage.setItem(MIGRATION_KEY, 'true');
  }
} catch (e) {
  console.error("Failed to clear local storage:", e);
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GlobalErrorBoundary>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </GlobalErrorBoundary>
  </StrictMode>,
)

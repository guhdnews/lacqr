# Tasks

- [x] Fix Moondream 'PhiForCausalLM' error <!-- id: 0 -->
- [x] Verify Frontend Integration (Time Option, Colored Cards, ai.ts labels) <!-- id: 1 -->
    - [ ] Verify "Time" option in Service Configurator
    - [ ] Verify "Colored Cards" aesthetic
    - [ ] Verify `ai.ts` handling of "nail" vs "nail_plate"
- [x] Update Documentation (webgemini.md) <!-- id: 2 -->
- [x] Investigate AI Accuracy & Pricing Logic (Fix "80$ Issue") <!-- id: 3 -->
- [x] Verify Scan & Price Workflow (Flawless Execution) <!-- id: 4 -->
- [x] Deploy to Vercel & Update Git <!-- id: 5 -->
- [x] Fix Moondream Deployment & Improve Accuracy (Implemented Open-World Pipeline) <!-- id: 6 -->
- [x] Final Deployment (Modal, Vercel, Git) <!-- id: 7 -->
- [x] Debug Accuracy & Remove Simulation Fallback (Gemini-First Approach) <!-- id: 8 -->
- [x] Redeploy with Accuracy Fixes & AI Inspector <!-- id: 9 -->
- [x] Debug Empty Florence Results (Backend Update) <!-- id: 10 -->
- [x] Tune Pricing & Complexity Logic (Leverage Florence Data) <!-- id: 11 -->
- [x] Implement Time-Based Pricing (Hourly Rate Sanity Check) <!-- id: 12 -->
- [x] Gap Analysis & Polish (Error Handling, Mobile UI) <!-- id: 13 -->
- [x] Deep Logic Audit & Comprehensive Mapping (Shapes, Art, Finishes) <!-- id: 14 -->
- [x] Refine Shape (Coffin vs Stiletto) & Description Detail <!-- id: 15 -->
- [x] Implement Time-Based Loading Notification (10s threshold) <!-- id: 16 -->
- [ ] Debug Persistent `lengthTier` Error & Logs Access <!-- id: 17 -->
    - [x] Create Remote Logger & Admin Page
    - [x] Fix Firestore Rules (User Applied)
    - [x] Fix Storage Rules (User Applied)
    - [x] Verify Firestore Write/Read (Diagnostic Page) - FAILED (404/Blank)
    - [ ] Debug Blank Page & 404 Issue
        - [ ] Check for Stale Service Worker (Vite PWA Legacy)
        - [ ] Implement Service Worker Killer in RootLayout
        - [ ] Verify Route Generation in Build
    - [ ] Fix `lengthTier` Root Cause (ServiceConfigurator/AI Service)
- [x] Strict Shape Logic (Tip Geometry) & Industry Standard Pricing Tiers <!-- id: 18 -->
- [x] UI Polish & Mobile Fixes <!-- id: 19 -->
    - [x] ScanningOverlay Contrast & Cutoff
    - [x] SmartQuoteView UI Match (LacqrLens style)
    - [x] Mobile Overflow Fixes (BookingPageBuilder, ServiceMenuEditor)
# Tasks

- [x] Fix Moondream 'PhiForCausalLM' error <!-- id: 0 -->
- [x] Verify Frontend Integration (Time Option, Colored Cards, ai.ts labels) <!-- id: 1 -->
    - [ ] Verify "Time" option in Service Configurator
    - [ ] Verify "Colored Cards" aesthetic
    - [ ] Verify `ai.ts` handling of "nail" vs "nail_plate"
- [x] Update Documentation (webgemini.md) <!-- id: 2 -->
- [x] Investigate AI Accuracy & Pricing Logic (Fix "80$ Issue") <!-- id: 3 -->
- [x] Verify Scan & Price Workflow (Flawless Execution) <!-- id: 4 -->
- [x] Deploy to Vercel & Update Git <!-- id: 5 -->
- [x] Fix Moondream Deployment & Improve Accuracy (Implemented Open-World Pipeline) <!-- id: 6 -->
- [x] Final Deployment (Modal, Vercel, Git) <!-- id: 7 -->
- [x] Debug Accuracy & Remove Simulation Fallback (Gemini-First Approach) <!-- id: 8 -->
- [x] Redeploy with Accuracy Fixes & AI Inspector <!-- id: 9 -->
- [x] Debug Empty Florence Results (Backend Update) <!-- id: 10 -->
- [x] Tune Pricing & Complexity Logic (Leverage Florence Data) <!-- id: 11 -->
- [x] Implement Time-Based Pricing (Hourly Rate Sanity Check) <!-- id: 12 -->
- [x] Gap Analysis & Polish (Error Handling, Mobile UI) <!-- id: 13 -->
- [x] Deep Logic Audit & Comprehensive Mapping (Shapes, Art, Finishes) <!-- id: 14 -->
- [x] Refine Shape (Coffin vs Stiletto) & Description Detail <!-- id: 15 -->
- [x] Implement Time-Based Loading Notification (10s threshold) <!-- id: 16 -->
- [ ] Debug Persistent `lengthTier` Error & Logs Access <!-- id: 17 -->
    - [x] Create Remote Logger & Admin Page
    - [x] Fix Firestore Rules (User Applied)
    - [x] Fix Storage Rules (User Applied)
    - [x] Verify Firestore Write/Read (Diagnostic Page) - FAILED (404/Blank)
    - [ ] Debug Blank Page & 404 Issue
        - [ ] Check for Stale Service Worker (Vite PWA Legacy)
        - [ ] Implement Service Worker Killer in RootLayout
        - [ ] Verify Route Generation in Build
    - [ ] Fix `lengthTier` Root Cause (ServiceConfigurator/AI Service)
- [x] Strict Shape Logic (Tip Geometry) & Industry Standard Pricing Tiers <!-- id: 18 -->
- [x] UI Polish & Mobile Fixes <!-- id: 19 -->
    - [x] ScanningOverlay Contrast & Cutoff
    - [x] SmartQuoteView UI Match (LacqrLens style)
    - [x] Mobile Overflow Fixes (BookingPageBuilder, ServiceMenuEditor)
    - [x] Zoom & Full Screen Interaction
    - [x] API Key Update
    - [x] Lacqr Lens Recent Scans Fix (Auto-save & Persistence Removal)
    - [x] Policy Agreement Validation
- [x] Stripe Connect Integration <!-- id: 20 -->
    - [x] Install Stripe SDK
    - [x] Create API route for Stripe Connect (`/api/stripe/connect`)
    - [x] Update `BookingEditor` to handle OAuth flow
    - [x] Verify account linking and status updates

- [x] **Booking Inbox (Fixing "Black Hole")**
    - [x] Create `BookingCard` component
    - [x] Create `/dashboard/bookings` page
    - [x] Update `Sidebar` navigation
    - [x] Update types for booking status (Handled locally in component for MVP)

- [x] **Fix Onboarding Stripe Flow**
    - [x] Analyze `OnboardingWizard` persistence
    - [x] Implement real Stripe Connect call
    - [x] Handle redirect return to Step 4
    - [x] Ensure data is not lost during redirect

- [x] **Refine Service Menu Editor**
    - [x] Implement "Delete Category"
    - [x] Implement "Delete Service"
    - [x] Implement "Reorder" (Implemented with dnd-kit)
    - [x] Fix "Zombie Data" (ensure deleted services are removed from durations)

- [x] **Secure API Endpoints**
    - [x] Audit `/api/stripe/connect` for auth verification
    - [x] Implement Firebase Admin check (using `firebase-admin` SDK)

- [x] **Implement Notification System ("The Silent App")**
    - [x] Create `NotificationStore` (Zustand + Firestore)
    - [x] Create `NotificationCenter` UI (Bell icon in Sidebar/Header)
    - [x] Trigger notifications on Booking Request
    - [x] Trigger notifications on Booking Acceptance/Decline (Simulated SMS)

- [x] **Stability & Performance**
    - [x] Implement Image Upload Limits (10MB Cap)

- [x] **Implement "Blind" Booking System (Calendar View)**
    - [x] Add "Calendar" toggle to Booking Inbox
    - [x] Create `CalendarView` component (using date-fns)
    - [x] Display accepted bookings on the calendar
    - [x] Allow clicking event to view details (Alert for MVP)

- [x] **Implement Data Safety (Export/Delete)**
    - [x] Add "Data & Privacy" tab to Settings
    - [x] Implement "Export Data" (JSON download of quotes/clients)
    - [x] Implement "Delete Account" (Disabled for MVP)
    - [x] Add "Delete" button to BookingCard (for individual cleanup)

- [x] **UI/UX Audit Fixes (Phase 1)**
    - [x] Fix Sidebar active state for sub-routes (Lost Navigation)
    - [x] Move `/drafts` to `/dashboard/drafts` (Layout Fix)
    - [x] Add "Notifications" tab to Settings (Gap Fill)
    - [x] Replace "Quick Tips" with Real Business Stats in Dashboard

- [x] **UI/UX Audit Fixes (Phase 2)**
    - [x] Mobile Settings: Add visual scroll cues (Gradient Fade)
    - [x] Public Booking: Polish Loading State (Custom Spinner)
    - [x] Public Booking: Polish Error State (Branded 404)

- [x] **Deep Dive & Gap Analysis (Phase 3)**
    - [x] Create Global 404 Page (`not-found.tsx`)
    - [x] Fix Mobile Menu Accessibility (Focus Trap & ARIA)
    - [x] Implement "Mark as Completed" Workflow in Booking Inbox
    - [x] Add "Completed" Filter & Stats to Booking Dashboard
    - [x] Add "Coming Soon" Badges for Portfolio & Analytics in Sidebar
    - [x] Implement Image Uploads (Firebase Storage) in Settings
    - [x] Fix Pricing Fragility (Prevent Negative Prices in Service Menu)
    - [x] Implement Stripe Payment Integration (Public Booking Page)
    - [x] Add "Delete Client" & "Preferences" UI to CRM Profile

# PROJECT CONTEXT & HANDOFF PROTOCOL
> **Last Updated:** 2025-11-28
> **Status:** Active Development (Sprint 2 Complete)

## 1. PROJECT IDENTITY
* **App:** Lacqr (SaaS for Nail Techs).
* **Goal:** Automated pricing and booking for nail art based on photo analysis.
* **Tech Stack:**
    *   **Frontend:** Next.js / React (Vite) + Tailwind CSS (Hosted on Vercel).
    *   **Backend (AI):** Python on Modal.com (Serverless GPU).
    *   **Database:** Firebase (Auth/Storage/Firestore) + Milvus (Vector DB for Visual Search).
*   **Documentation:**
    *   `webgemini.md`: Comprehensive project knowledge base for AI assistants.
    *   `task.md`: Active task tracking and status.
    *   `implementation_plan.md`: Technical design and verification plans.
    *   `walkthrough.md`: Proof of work and feature demonstrations.

## 2. PROJECT HISTORY & EVOLUTION
### Phase 1: The "Dream Stack" Implementation (Sprint 1)
*   **Objective:** Move beyond simple LLM analysis (which hallucinated gem counts) to a deterministic Computer Vision pipeline.
*   **Key Achievement:** Implemented the **"Open World" AI Pipeline**:
    1.  **YOLOv11 (Object Detection):** Trained on `lacqrtraining_dataset_v3` (~1500 images) to count gems, charms, and fingers accurately.
    2.  **Moondream (VLM):** Used for visual question answering (e.g., "Describe the art style").
### 💻 Frontend Structure
*   **Dashboard:** `src/pages/Dashboard.tsx` - Main landing for auth users.
*   **Lacqr Lens:** `src/pages/LacqrLens.tsx` - The core scanning tool.
    *   **Receipt Builder:** `src/components/admin/ReceiptBuilder.tsx` - Final step of scanning.
*   **Service Sorter:** `src/pages/SmartQuote.tsx` - DM Reply & Booking tool.
    *   **Public View:** `src/pages/public/PublicSmartQuote.tsx` - For clients.
*   **Settings:** `src/pages/Settings.tsx` - Profile & Config.
*   **CRM:** `src/pages/CRMDashboard.tsx` - Client stats & actions.
    *   **Client List:** `src/pages/ClientList.tsx` - Client directory.
    *   **Client Profile:** `src/pages/ClientProfile.tsx` - Detailed view & history.
*   **Booking:** `src/pages/PublicBooking.tsx` - Public booking page.

## 4. BUSINESS LOGIC RULES (The "Source of Truth")
### 📏 Length Pricing (Aspect Ratio)
*   **Short:** Ratio < 1.1 (+$0)
*   **Medium:** Ratio 1.1 - 1.5 (+$15)
*   **Long:** Ratio 1.5 - 2.0 (+$25)
*   **XL:** Ratio > 2.0 (+$35)

### 💎 Bling Density (Area Coverage)
*   **Minimal:** < 5% coverage (+$10)
*   **Moderate:** 5% - 20% coverage (+$30)
*   **Heavy:** > 20% coverage (+$60)

### 🎨 Art Tiers
*   **Tier 1 (Simple):** Basic polish/solid color.
*   **Tier 2 (Intermediate):** French, Ombre, or < 3 charms.
*   **Tier 3 (Complex):** 3D Art, Hand Painted, or > 2 charms.
*   **Tier 4 (Extreme):** Encapsulated, > 5 charms.

## 5. BATTLE SCARS & KNOWN ISSUES
### 🐛 Bugs Fought & Won (Do Not Regress!)
*   **The "55 Gems" Hallucination:**
    *   *Issue:* LLMs would guess gem counts wildly.
    *   *Fix:* **Strictly** use YOLOv11 for counting. Never ask Gemini to count.
*   **Pricing Math:**
    *   *Issue:* Aspect Ratio logic was flawed.
    *   *Fix:* Refined in `pricing_engine.ts`: Ratio = Height/Width.
*   **Modal Dependency Hell:**
    *   *Issue:* `ImportError: libGL.so.1` and `PhiForCausalLM` errors.
    *   *Fix:* Added `libgl1` to system deps and pinned `transformers==4.44.2`.
*   **"No Clients Found":**
    *   *Issue:* Firestore query required a composite index for sorting.
    *   *Fix:* Moved sorting to client-side (JavaScript) to avoid index management overhead.

### ⚠️ Active Notes
*   **PDF Generation:** Currently uses `window.print()` with `@media print` CSS. This is an MVP solution; a dedicated PDF library (like `react-pdf`) may be needed for pixel-perfect control later.
*   **Moondream Stability:** Moondream (VLM) can be heavy. If it fails, the pipeline falls back to Gemini-only analysis (which is less accurate for spatial details but more robust).

## 6. ENVIRONMENT & DEPLOYMENT
### 🔑 API Keys & Secrets
*   **Modal:** Managed via CLI (`modal token set`).
*   **Zilliz (Milvus):** URI and Token are hardcoded in `lacqr_modal/main.py` (Modal Secrets).
*   **Firebase:** Config is in `src/lib/firebase.ts` (Public/Client-side keys).

### 🛠️ Useful Commands
*   **Deploy Backend:** `python -m modal deploy lacqr_modal/main.py`
*   **Start Frontend:** `npm run dev`
*   **Deploy Frontend:** `npx vercel --prod`

## 7. RECENT SPRINTS & CURRENT STATUS
### Sprint 3: Polish & Fixes (Completed)
*   **Goal:** Address user feedback and fix critical UI/UX bugs.
*   **Key Deliverables:**
    *   **Help & Support:** Functional "Read Guide" / "View Tips" buttons using `HelpModal`.
    *   **Settings Overhaul:** Restored detailed profile/account settings.
    *   **Drafts System:** Dedicated page for saved quotes.
    *   **Deployment:** Successfully deployed to Vercel (Production).

### Sprint 4: Visual Polish & Assets (In Progress)
*   **Goal:** Source high-quality visual assets to replace placeholders and achieve a "Minimalist Luxury" aesthetic.
*   **Current Status:** Assets have been sourced (Stock Photos), but the user is considering pivoting to AI-generated images (Nano Banana Pro).
*   **Sourced Asset Candidates (Stock):**
    *   **Hero Image (Salon):** `https://images.unsplash.com/photo-1595944024804-733665a112db`
    *   **Feature Image (Macro):** `https://plus.unsplash.com/premium_photo-1754759082639-2e1eda42c5f4?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8bmFpbCUyMGFydCUyMG1hY3JvfGVufDB8fDB8fHww`
    *   **Portraits (Social Proof):**
        *   `https://images.unsplash.com/photo-1758598304332-94b40ce7c7b4`
        *   `https://images.unsplash.com/photo-1758691737587-7630b4d31d16`
        *   `https://plus.unsplash.com/premium_photo-1670884442927-e647436e12ff`
### Sprint 5: CRM & Booking Expansion (Completed)
*   **Goal:** Build a comprehensive CRM and client-facing booking system.
*   **Key Deliverables:**
    *   **Onboarding 2.0:** Simplified 4-step wizard (Profile -> Salon -> Menu -> Payments) and "Getting Started" widget.
    *   **CRM Dashboard:** Central hub (`/crm`) with client stats, recent activity, and quick actions.
    *   **Enhanced Client Profiles:** Tabs for "Overview" (Instagram, Birthday, Preferences) and "History" (past appointments).
    *   **Public Booking Page:** Client-facing booking flow (`/book/:handle`) with service selection and appointment creation.
    *   **Client List:** Improved table layout with "Last Visit" tracking.
    *   **Lacqr Lens Stability:** Fixed "Blank Screen" crash with Error Boundaries.
    *   **Drafts System:** Implemented 14-day retention policy and auto-cleanup logic.
    *   **PDF Generation:** Replaced `window.print()` with robust `html2canvas` + `jspdf` solution.
    *   **Onboarding Refinements:** Added "Skip" button, optional fields, and improved flow.

### Sprint 6: Advanced CRM & Customization (Completed)
*   **Goal:** Deepen CRM capabilities and allow users to customize their booking pages.
*   **Key Deliverables:**
    *   **Interaction History:** Full CRUD (Create, Read, Update, Delete) for client notes, calls, texts, and emails.
    *   **Booking Page Builder:** New Settings tab to customize booking page theme, background (Solid, Gradient, Image), and layout (Centered, Split).
    *   **Dynamic Booking Page:** `PublicBooking.tsx` now adapts to user-defined settings for a branded experience.
    *   **UI/UX Polish:** Integrated builder into Settings and ensured mobile responsiveness.

### Sprint 7: Critical Fixes & Content Expansion (Completed)
*   **Goal:** Resolve persistent "Blank Page" and "Auth" issues, and build out marketing content.
*   **Key Deliverables:**
    *   **Blank Page Fix:** Implemented aggressive "Nuclear Option" (Service Worker removal + LocalStorage clear) to resolve persistent caching issues.
    *   **Google Auth Fix:** Updated `firestore.rules` to allow authenticated users to create their own profile documents.
    *   **Mobile Navigation:** Moved intrusive floating toggle to a dedicated top bar.
    *   **New Pages:** Built comprehensive `Features.tsx`, `Pricing.tsx`, and `FAQ.tsx` pages.
    *   **UI Polish:** Added "Go to Dashboard" button to header and restored footer links.
    *   **Error Handling:** Added detailed error logging to Login/Signup flows.

## 8. NEXT STEPS
*   **Dashboard Overhaul:** Redesign the main dashboard for better aesthetics and utility.
*   **Performance Optimization:** Audit bundle size and lazy load components.
*   **Testing:** Implement E2E tests for critical flows (Signup -> Onboarding -> Scan).

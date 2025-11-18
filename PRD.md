# Product Requirement Document (PRD) - Nail Tech Co-Pilot

## 1. Executive Summary
Nail Tech Co-Pilot is a mobile-first web application designed to help Nail Technicians automate pricing and booking. It leverages AI (Gemini 3.0 Pro) to analyze images for pricing/booking.

## 2. Core Features

### 2.1. Tool 1: QuoteCam (Revenue Engine)
*   **Goal:** Eliminate pricing guesswork.
*   **Input:** Photo of nail design (uploaded by user).
*   **Process:**
    *   Analyze image using Vision API.
    *   Identify "Cost Drivers": Length, Shape, Chrome, 3D Art, French Tip, Complexity.
    *   Calculate price based on a configurable "Menu" (default values provided).
*   **Output:** Digital Receipt with:
    *   Itemized breakdown.
    *   Estimated Time.
    *   Suggested Price.

### 2.2. Tool 2: Service Sorter (Booking Fixer)
*   **Goal:** Streamline booking instructions.
*   **Input:** Inspiration picture (uploaded by user).
*   **Process:**
    *   Analyze image to determine required services (e.g., "Gel-X", "Level 2 Art").
    *   Map to standard service menu.
*   **Output:** Pre-written text for client: "To get this look, please book [Service A] + [Service B]."



## 3. User Interface (UX/UI)
*   **Aesthetic:** "Glossier-style" - Minimalist, Clean, High-Fashion.
*   **Color Palette:**
    *   Primary Background: White / Soft Pink (#FCE4EC)
    *   Text: Deep Charcoal (#212121)
    *   Accents: Muted Gold or Rose Gold.
*   **Navigation:** Bottom Navigation Bar (Mobile-First).
    *   Icons: Camera (QuoteCam), List/Search (Service Sorter).

## 4. Technical Architecture
*   **Frontend:** React (Vite), Tailwind CSS.
*   **State Management:** React Context or Local State (Simple SPA).
*   **Backend/Services:**
    *   Firebase (Auth, Firestore for saving history/settings).
    *   Gemini API (Vision & Text generation).
*   **Deployment:** Vercel/Netlify.

## 5. File Structure (Proposed)
```
src/
├── components/
│   ├── Layout.tsx       # Bottom Nav Wrapper
│   ├── Button.tsx       # Reusable UI component
│   ├── ImageUpload.tsx  # Reusable Camera/Upload component
│   └── ResultCard.tsx   # Display for Quote/Booking info
├── pages/
│   ├── LandingPage.tsx  # Marketing Page
│   ├── QuoteCam.tsx     # Tool 1
│   ├── ServiceSorter.tsx# Tool 2
├── lib/
│   ├── gemini.ts        # API handling
│   └── pricing.ts       # Pricing logic/constants
├── App.tsx
└── main.tsx
```

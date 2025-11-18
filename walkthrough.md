# Walkthrough - Nail Tech Co-Pilot

## Overview
Nail Tech Co-Pilot is a mobile-first SaaS application designed to help Nail Technicians automate pricing and booking. The application features a high-converting landing page and two core tools: QuoteCam and Service Sorter.

## Features Implemented

### 1. Landing Page
- **Hero Section:** "Stop Guessing Your Prices" headline with "Glossier-style" aesthetics (Pink/Charcoal).
- **Features:** Breakdown of QuoteCam, Service Sorter, and Client Shield.
- **Pricing:** Transparent pricing tiers (Starter vs. Pro Boss).
- **Navigation:** Smooth routing to the app.

### 2. QuoteCam (Tool 1)
- **Function:** Upload a nail design photo to get an instant price quote.
- **Implementation:**
    - Image upload with preview.
    - "Scanning" animation to simulate AI processing.
    - Detailed receipt generation (Cost Drivers, Time, Total Price).
- **Aesthetics:** Clean, receipt-style card with pink accents.

### 3. Service Sorter (Tool 2)
- **Function:** Upload an inspo pic to get a pre-written booking message.
- **Implementation:**
    - Image upload with preview.
    - Service matching logic (mocked).
    - Copy-pasteable client message.
- **Aesthetics:** Simple, action-oriented UI.

## How to Verify
1.  **Start the App:** Run `npm run dev` in the terminal.
2.  **Landing Page:** Open the local URL. Verify the design matches the "Clean Girl Aesthetic".
3.  **QuoteCam:** Click "Try QuoteCam Free". Upload an image. Watch the scanning animation and check the generated receipt.
4.  **Service Sorter:** Navigate to "Sort" via the bottom bar. Upload an image. Check the generated booking message and try the "Copy" button.

## Tech Stack
- **Framework:** React + Vite
- **Styling:** Tailwind CSS (Custom Config)
- **Icons:** Lucide React
- **Routing:** React Router DOM

# Lacqr Project Context (WebGemini)

This document serves as the **Source of Truth** for the Lacqr project. It is intended to be read by an AI assistant to understand the full context of the codebase, architecture, and current state.

## 1. Project Overview
**Name:** Lacqr
**Goal:** A "Nail Tech Co-Pilot" SaaS that automates pricing, booking, and design analysis for nail salons using advanced AI.
**Core Features:**
*   **Lacqr Lens:** AI camera that scans nail designs and estimates price/time.
*   **Service Configurator:** Interactive UI for customizing nail sets (Shape, Length, Art, Bling).
*   **Smart Pricing:** Dynamic pricing engine based on aspect ratio, surface area, and complexity.

## 2. Tech Stack & Architecture

### Frontend (Client)
*   **Framework:** React (Vite) + TypeScript.
*   **Hosting:** Vercel.
*   **Styling:** Tailwind CSS (Custom "Cosmic" theme with Pink/Blue/Yellow cards).
*   **State Management:** Zustand (`useServiceStore`, `useAppStore`).
*   **Key Components:**
    *   `src/components/ServiceConfigurator.tsx`: Main pricing UI.
    *   `src/pages/LacqrLens.tsx`: Camera/Upload interface with AI overlay.
    *   `src/services/ai.ts`: Bridge to Modal backend.

### Backend (The Brain)
*   **Platform:** Modal.com (Serverless GPU).
*   **Language:** Python 3.10+.
*   **Entry Point:** `lacqr_modal/main.py`.
*   **AI Pipeline:**
    1.  **Detection:** YOLOv11 (Custom trained `best.pt`) for identifying nails, gems, charms, art.
    2.  **Segmentation:** SAM 2 (Segment Anything Model 2) for precise masks.
    3.  **Description:** Moondream (VLM) for natural language visual description.
    4.  **Vector DB:** Zilliz (Milvus) for similarity search (Visual Dictionary).

### Data & Storage
*   **Database:** Firebase Firestore (Clients, Quotes, Training Data).
*   **Storage:** Firebase Storage (Images).
*   **Vector DB:** Zilliz Cloud.

## 3. Data Schemas

### Service Selection (`src/types/serviceSchema.ts`)
The core data structure representing a client's order.
```typescript
export interface ServiceSelection {
    base: {
        system: 'Acrylic' | 'Gel-X' | 'Hard Gel' | 'Structure Gel';
        shape: 'Square' | 'Coffin' | 'Stiletto' | 'Almond';
        length: 'Short' | 'Medium' | 'Long' | 'XL' | 'XXL';
    };
    addons: {
        finish: 'Glossy' | 'Matte';
        specialtyEffect: 'None' | 'Chrome' | 'Holo' | 'Cat Eye';
        classicDesign: 'None' | 'French Tip' | 'Ombre';
    };
    art: {
        level: 'Level 1' | 'Level 2' | 'Level 3' | 'Level 4' | null;
    };
    bling: {
        density: 'None' | 'Minimal' | 'Moderate' | 'Heavy';
        xlCharmsCount: number;
        piercingsCount: number;
    };
    // ... modifiers, pedicure ...
    
    // AI & Pricing Metadata
    visual_description?: string;
    appointmentTime?: string;
    estimatedPrice?: number;
    pricingDetails?: any; // Breakdown of costs
    modalResult?: any; // Raw YOLO/SAM output
    aiDescription?: string; // Moondream output
}
```

### Pricing Logic (`src/utils/pricing_engine.ts`)
*   **Base Price:** Fixed by System (e.g., Acrylic $55).
*   **Length:** Calculated via **Aspect Ratio** (Height/Width) of `nail_plate`.
    *   < 1.1: Short ($0)
    *   < 1.5: Medium ($5)
    *   < 2.0: Long ($10)
    *   > 2.0: XL ($15)
*   **Bling Density:** Calculated via **Surface Area** of gems/charms relative to nail plate.
    *   < 5%: Minimal ($10)
    *   < 20%: Moderate ($25)
    *   > 20%: Heavy ($50)
*   **Art Complexity:** Based on unique tags (`3d_art`, `hand_painted`, `french`) and item counts.

## 4. Current State (As of Nov 27, 2025)

### ✅ Completed
*   **Custom AI Model:** `best.pt` is deployed on Modal and baked into the image.
*   **Visual Description:** Moondream VLM generates text descriptions of designs.
*   **UI Restoration:**
    *   `ServiceConfigurator` uses colored cards (Pink=Canvas, Blue=Design, Yellow=Inventory).
    *   Itemized Price Breakdown is visible.
    *   Duration estimate (e.g., "1h 30m") is displayed.
*   **Bounding Boxes:** `LacqrLens` renders an overlay of detected objects.

### 🚧 In Progress / Next Steps
*   **Verification:** Testing with diverse images to validate variance.
*   **Dream Preview:** Generative AI for visualizing design changes (Future).
*   **Milvus Integration:** Full implementation of "Visual Dictionary" search.

## 5. Deployment Info
*   **Vercel (Frontend):** `https://lacqr.vercel.app` (Production)
*   **Modal (Backend):** `https://upfacedevelopment--lacqr-brain-analyze-image.modal.run`
*   **GitHub:** `https://github.com/guhdnews/lacqr`

## 6. Key Commands
*   **Run Frontend:** `npm run dev`
*   **Deploy Backend:** `python -m modal deploy lacqr_modal/main.py`
*   **Train Model:** `python lacqr_training/setup_and_train_combined.py`

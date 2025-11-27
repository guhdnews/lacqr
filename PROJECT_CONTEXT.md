# PROJECT CONTEXT & HANDOFF PROTOCOL
> **Last Updated:** 2025-11-27
> **Status:** Active Development (Dream Stack Implementation)

## 1. PROJECT IDENTITY
* **App:** Lacqr (SaaS for Nail Techs).
* **Goal:** Automated pricing and booking for nail art based on photo analysis.
* **Tech Stack:**
    *   **Frontend:** Next.js / React (Vite) + Tailwind CSS (Hosted on Vercel).
    *   **Backend (AI):** Python on Modal.com (Serverless GPU).
    *   **Database:** Firebase (Auth/Storage/Firestore) + Milvus (Vector DB for Visual Search).
*   **Current Phase:** Pivoting from simple LLM analysis to "The Dream Stack" (Multi-stage Computer Vision Pipeline).
*   **Documentation:**
    *   `webgemini.md`: Comprehensive project knowledge base for AI assistants.
    *   `task.md`: Active task tracking and status.
*   `sahi` (Sliced Inference)
*   `segment-anything-2` (SAM 2)
*   `transformers==4.44.2` (Moondream/HuggingFace)
*   `pymilvus` (Vector DB Client)
*   `einops`, `timm` (Moondream requirements)
*   `libgl1` (System dependency for OpenCV)

## 3. KNOWN ISSUES & HISTORY (CRITICAL)
### 🐛 Bugs Fought & Won
*   **The "55 Gems" Hallucination:** Standard LLMs (Gemini 1.5 Flash) consistently hallucinated gem counts (e.g., counting 55 gems on a plain nail).
    *   *Fix:* Switched to **YOLOv11 Object Detection**. We now count bounding boxes deterministically.
*   **Pricing Math:** Aspect Ratio logic was initially flawed.
    *   *Fix:* Refined logic in `pricing_engine.ts`: Ratio = Height/Width.
*   **Modal Deployment:** `fastapi_endpoint` vs `web_endpoint` version mismatch.
    *   *Fix:* Reverted to `@app.function(image=image)` + `@modal.web_endpoint()`.
*   **OpenCV Imports:** `ImportError: libGL.so.1` on Modal.
    *   *Fix:* Added `libgl1` to `apt_install` in Modal image definition.

### ⚠️ Active Issues / WIP
*   **Moondream Failure:** The Moondream model currently throws `'PhiForCausalLM' object has no attribute 'generate'`.
    *   *Status:* **Fixed.** Pinned `transformers==4.44.2` to resolve `PhiForCausalLM` generation attribute error.
*   **Frontend Integration:** The frontend `ai.ts` was just updated to handle "nail" vs "nail_plate" labels. Needs user testing.

### 🎨 Recent UI Changes (Verify These!)
*   **"Time" Option:** Added to the Service Configurator to allow users to select appointment duration preference.
*   **Colored Cards:** Restored the gradient/colored card aesthetic in the main UI (previously broken by a refactor).

## 4. REAL-TIME FILE MAP (SCAN)
### 🧠 AI / Backend
*   **Main Logic:** `lacqr_modal/main.py` (The Brain).
*   **Main Logic:** `lacqr_modal/main.py` (The Brain).
*   **Debug Script:** `debug_modal.py` (Verifies the live endpoint).
    *   *Output:* JSON with `objects` (detections), `description` (text), `materials` (tags), and `meta` (debug info).
*   **Trained Model:** `backend/models/best.pt` (Custom YOLOv11 trained on `lacqrtraining_dataset_v3`).
*   **Training Data:**
    *   `lacqrtraining_dataset_v3` (Most recent, ~1500 images).
    *   `combined_data.yaml` (Training config).

### 💻 Frontend
*   **Pricing Logic:** `src/utils/pricingCalculator.ts` (Unified Source of Truth for math).
*   **AI Service:** `src/services/ai.ts` (Orchestrates Firebase Upload -> Modal Call).
*   **Config:** `vite.config.ts`, `vercel.json`.

## 5. BUSINESS LOGIC RULES
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

## 6. THE "MISSING LINK" CHECK (BRAIN DUMP)
### 🔑 API Keys & Secrets
*   **Modal:** Managed via CLI (`modal token set`).
*   **Zilliz (Milvus):** URI and Token are hardcoded in `lacqr_modal/main.py` (Modal Secrets).
*   **Firebase:** Config is in `src/lib/firebase.ts` (Public/Client-side keys).

### 🔐 Required .env Keys (Create this file!)
```env
# Frontend (Vite)
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...

# Backend (Modal Secrets - Set via CLI)
# modal secret create zilliz-secret ZILLIZ_URI=... ZILLIZ_TOKEN=...
```

### 🛠️ Useful Commands
*   **Deploy Backend:** `python -m modal deploy lacqr_modal/main.py`
*   **Test Backend:** `python debug_modal.py`
*   **Start Frontend:** `npm run dev`

### 📝 Next Steps for Next Agent
1.  **Fix Moondream:** Investigate the `transformers` / `PhiForCausalLM` version mismatch. Consider switching to a different VLM if Moondream remains unstable.
2.  **Verify Frontend:** Ensure the "Time" option and "Colored Cards" UI changes (from previous tasks) are still intact and working with the new pricing engine.
3.  **Documentation:** Update `webgemini.md` to reflect the final "Dream Stack" architecture once Moondream is fixed.

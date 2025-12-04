## Proposed Changes
### UI Components
#### [MODIFY] [page.tsx](file:///c:/Users/PHELPS/Documents/Lacqr/src/app/dashboard/lacqr-lens/page.tsx)
- [x] **Implement Mode Toggle UI**
    - [x] Add segmented control for "Assess Hand" vs "Analyze Inspo".
    - [x] Add contextual hint overlay.
- [x] **Implement Result Preview**
    - [x] Create "Required Prep" list for Diagnostics mode.
    - [x] Create "Design Elements" list for Design mode.
## Proposed Changes
### UI Components
#### [MODIFY] [page.tsx](file:///c:/Users/PHELPS/Documents/Lacqr/src/app/dashboard/lacqr-lens/page.tsx)
- [x] **Implement Mode Toggle UI**
    - [x] Add segmented control for "Assess Hand" vs "Analyze Inspo".
    - [x] Add contextual hint overlay.
- [x] **Implement Result Preview**
    - [x] Create "Required Prep" list for Diagnostics mode.
    - [x] Create "Design Elements" list for Design mode.
- [x] **Update ScanningOverlay**
    - [x] Accept `mode` prop.
    - [x] Show different steps/icons based on mode.
- [ ] **Refine Visual Integration**
    - [ ] Wrap Lens interface in a "Device Card" to blend with Dashboard.
    - [ ] Remove full-screen black background.
    - [ ] Use `bg-gray-50` for the page background.
- [ ] **Fix Animation & UX**
    - [ ] Ensure `ScanningOverlay` is visible *during* analysis (overlaying the image).
    - [ ] Add prominent "Start Scan" button/label in the center when idle.
- [ ] **CRM & Booking Integration**
    - [ ] Verify "Assign Client" saves quote to `users/{userId}/quotes`.
    - [ ] Update Client Profile (`crm/[id]/page.tsx`) to display saved quotes.
    - [ ] Add "Book This Quote" button in Client Profile to convert quote to appointment.
    - [ ] Ensure pricing from Lens carries over to Booking.

### Logic & State
- [ ] **Animation Logic**: Update render condition to `(isAnalyzing || !image)` for the overlay container.

## Verification Plan
### Manual Verification
- [ ] **Visual Check**: Verify Lens looks like a card within the dashboard.
- [ ] **Animation Check**: Upload an image and verify the scanning animation plays *over* the image.
- [ ] **Flow Check**: Scan -> Configure -> Assign Client -> Go to CRM -> Verify Quote -> Click "Book".

# Implementation Plan - Kill Zombie Service Worker

## Goal Description
Forcefully unregister the legacy Vite Service Worker that is breaking the Next.js app.

## User Review Required
> [!IMPORTANT]
> I am deploying a `public/sw.js` file. This file is a "Self-Destruct" Service Worker. It will replace the missing (404) legacy Service Worker. When the browser updates it, this script will immediately unregister itself, clearing the interference.

## Proposed Changes

### Infrastructure
#### [NEW] [sw.js](file:///c:/Users/PHELPS/Documents/Lacqr/public/sw.js)
- Create a Service Worker that calls `self.registration.unregister()` on activation.

## Verification Plan
- **Manual:** Deploy, then reload `lacqr.io`. The 404s should disappear.

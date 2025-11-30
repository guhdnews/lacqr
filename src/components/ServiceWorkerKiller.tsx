'use client';

import { useEffect } from "react";

export default function ServiceWorkerKiller() {
    useEffect(() => {
        if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
            navigator.serviceWorker.getRegistrations().then(registrations => {
                for (let registration of registrations) {
                    console.log('Unregistering SW:', registration.scope);
                    registration.unregister();
                }
            });
        }
    }, []);
    return null;
}

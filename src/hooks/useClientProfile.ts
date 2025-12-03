import { useState, useEffect, useCallback } from 'react';
import { doc, getDoc, collection, query, where, orderBy, limit, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Client, ClientStats, ClientLifecycle } from '@/types/client';
import { ServiceRecord } from '@/types/serviceRecord';

interface SmartProfileData {
    client: Client | null;
    lastServiceSnapshot: ServiceRecord | null;
    history: ServiceRecord[];
    pendingQuotes: any[]; // Add pendingQuotes
    loading: boolean;
    error: string | null;
}

export function useClientProfile(userId: string | undefined, clientId: string) {
    const [data, setData] = useState<SmartProfileData>({
        client: null,
        lastServiceSnapshot: null,
        history: [],
        pendingQuotes: [],
        loading: true,
        error: null
    });

    // ... calculateStats ...

    const fetchProfile = useCallback(async () => {
        if (!userId || !clientId) return;

        try {
            // 1. Fetch Client Basic Info
            const clientRef = doc(db, 'users', userId, 'clients', clientId);
            const clientSnap = await getDoc(clientRef);

            if (!clientSnap.exists()) {
                setData(prev => ({ ...prev, loading: false, error: "Client not found" }));
                return;
            }

            const clientData = { id: clientSnap.id, ...clientSnap.data() } as Client;

            // 2. Fetch Service History (The "VIN" Records)
            const historyRef = collection(db, 'service_records');
            const q = query(
                historyRef,
                where('clientId', '==', clientId),
                orderBy('date', 'desc')
            );
            const historySnap = await getDocs(q);
            const history = historySnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as ServiceRecord));

            // 3. Fetch Pending Quotes
            const quotesRef = collection(db, 'quotes');
            const quotesQ = query(
                quotesRef,
                where('clientId', '==', clientId),
                where('status', '==', 'pending'), // Assuming 'status' field exists or we filter by type
                orderBy('createdAt', 'desc')
            );
            // Note: If 'status' doesn't exist, we might need to fetch all and filter in memory or adjust query
            // For now, let's assume we just want all quotes for this client that aren't "converted" if that concept exists.
            // Or just all quotes.
            const quotesQ2 = query(
                quotesRef,
                where('clientId', '==', clientId),
                orderBy('createdAt', 'desc')
            );

            const quotesSnap = await getDocs(quotesQ2);
            const pendingQuotes = quotesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));


            // 4. Smart Construction (Calculate derived stats)
            const { stats, lifecycle } = calculateStats(history);

            // Merge calculated stats into client object for UI
            const smartClient: Client = {
                ...clientData,
                stats: { ...clientData.stats, ...stats },
                lifecycle: { ...clientData.lifecycle, ...lifecycle }
            };

            setData({
                client: smartClient,
                lastServiceSnapshot: history.length > 0 ? history[0] : null,
                history,
                pendingQuotes,
                loading: false,
                error: null
            });

            import { useState, useEffect, useCallback } from 'react';
            import { doc, getDoc, collection, query, where, orderBy, limit, getDocs, Timestamp } from 'firebase/firestore';
            import { db } from '@/lib/firebase';
            import { Client, ClientStats, ClientLifecycle } from '@/types/client';
            import { ServiceRecord } from '@/types/serviceRecord';

            interface SmartProfileData {
                client: Client | null;
                lastServiceSnapshot: ServiceRecord | null;
                history: ServiceRecord[];
                pendingQuotes: any[]; // Add pendingQuotes
                loading: boolean;
                error: string | null;
            }

            export function useClientProfile(userId: string | undefined, clientId: string) {
                const [data, setData] = useState<SmartProfileData>({
                    client: null,
                    lastServiceSnapshot: null,
                    history: [],
                    pendingQuotes: [],
                    loading: true,
                    error: null
                });

                // ... calculateStats ...

                const fetchProfile = useCallback(async () => {
                    if (!userId || !clientId) return;

                    try {
                        // 1. Fetch Client Basic Info
                        const clientRef = doc(db, 'users', userId, 'clients', clientId);
                        const clientSnap = await getDoc(clientRef);

                        if (!clientSnap.exists()) {
                            setData(prev => ({ ...prev, loading: false, error: "Client not found" }));
                            return;
                        }

                        const clientData = { id: clientSnap.id, ...clientSnap.data() } as Client;

                        // 2. Fetch Service History (The "VIN" Records)
                        const historyRef = collection(db, 'service_records');
                        const q = query(
                            historyRef,
                            where('clientId', '==', clientId),
                            orderBy('date', 'desc')
                        );
                        const historySnap = await getDocs(q);
                        const history = historySnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as ServiceRecord));

                        // 3. Fetch Pending Quotes
                        const quotesRef = collection(db, 'quotes');
                        const quotesQ = query(
                            quotesRef,
                            where('clientId', '==', clientId),
                            where('status', '==', 'pending'), // Assuming 'status' field exists or we filter by type
                            orderBy('createdAt', 'desc')
                        );
                        // Note: If 'status' doesn't exist, we might need to fetch all and filter in memory or adjust query
                        // For now, let's assume we just want all quotes for this client that aren't "converted" if that concept exists.
                        // Or just all quotes.
                        const quotesQ2 = query(
                            quotesRef,
                            where('clientId', '==', clientId),
                            orderBy('createdAt', 'desc')
                        );

                        const quotesSnap = await getDocs(quotesQ2);
                        const pendingQuotes = quotesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));


                        // 4. Smart Construction (Calculate derived stats)
                        const { stats, lifecycle } = calculateStats(history);

                        // Merge calculated stats into client object for UI
                        const smartClient: Client = {
                            ...clientData,
                            stats: { ...clientData.stats, ...stats },
                            lifecycle: { ...clientData.lifecycle, ...lifecycle }
                        };

                        setData({
                            client: smartClient,
                            lastServiceSnapshot: history.length > 0 ? history[0] : null,
                            history,
                            pendingQuotes,
                            loading: false,
                            error: null
                        });

                    } catch (err: any) {
                        console.error("Error fetching smart profile:", err);
                        setData(prev => ({ ...prev, loading: false, error: err.message }));
                    }
                }, [userId, clientId]);

                useEffect(() => {
                    fetchProfile();
                }, [fetchProfile]);

                return { ...data, refresh: fetchProfile };
            }

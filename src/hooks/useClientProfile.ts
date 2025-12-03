import { useState, useEffect, useCallback } from 'react';
import { doc, getDoc, collection, query, where, orderBy, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Client, ClientStats, ClientLifecycle } from '@/types/client';
import { ServiceRecord } from '@/types/serviceRecord';

interface SmartProfileData {
    client: Client | null;
    lastServiceSnapshot: ServiceRecord | null;
    history: ServiceRecord[];
    pendingQuotes: any[];
    loading: boolean;
    error: string | null;
    refresh: () => void;
}

// Helper to calculate stats
const calculateStats = (history: ServiceRecord[]): { stats: Partial<ClientStats>, lifecycle: Partial<ClientLifecycle> } => {
    if (history.length === 0) {
        return { stats: {}, lifecycle: {} };
    }

    const totalSpend = history.reduce((sum, record) => sum + record.price, 0);
    const visitCount = history.length;
    const averageTicket = totalSpend / visitCount;

    // Simple grading logic
    let clientGrade: ClientStats['clientGrade'] = 'New';
    if (visitCount > 10 && averageTicket > 50) clientGrade = 'A+';
    else if (visitCount > 5 && averageTicket > 40) clientGrade = 'A';
    else if (visitCount > 2) clientGrade = 'B';

    // Predicted next visit (simple average cycle)
    let predictedNextVisit: Timestamp | undefined;
    if (history.length >= 2) {
        // Sort by date desc
        const sorted = [...history].sort((a, b) => b.date.seconds - a.date.seconds);
        const lastDate = sorted[0].date.seconds * 1000;
        const firstDate = sorted[sorted.length - 1].date.seconds * 1000;
        const daysDiff = (lastDate - firstDate) / (1000 * 60 * 60 * 24);
        const avgCycle = daysDiff / (visitCount - 1);

        const nextDate = new Date(lastDate + avgCycle * 24 * 60 * 60 * 1000);
        predictedNextVisit = Timestamp.fromDate(nextDate);
    }

    return {
        stats: {
            totalSpend,
            visitCount,
            averageTicket,
            clientGrade,
            lastVisitDate: history[0].date
        },
        lifecycle: {
            predictedNextVisit
        }
    };
};

export function useClientProfile(userId: string | undefined, clientId: string) {
    const [data, setData] = useState<Omit<SmartProfileData, 'refresh'>>({
        client: null,
        lastServiceSnapshot: null,
        history: [],
        pendingQuotes: [],
        loading: true,
        error: null
    });

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

            // 2. Fetch Service History
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
                where('status', '==', 'pending'),
                orderBy('createdAt', 'desc')
            );
            const quotesSnap = await getDocs(quotesQ);
            const pendingQuotes = quotesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            // 4. Calculate Stats
            const { stats, lifecycle } = calculateStats(history);

            const smartClient: Client = {
                ...clientData,
                stats: { ...clientData.stats, ...stats } as ClientStats,
                lifecycle: { ...clientData.lifecycle, ...lifecycle } as ClientLifecycle
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

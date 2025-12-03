import { useState, useEffect, useCallback } from 'react';
import { doc, getDoc, collection, query, where, orderBy, limit, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Client, ClientStats, ClientLifecycle } from '@/types/client';
import { ServiceRecord } from '@/types/serviceRecord';

interface SmartProfileData {
    client: Client | null;
    lastServiceSnapshot: ServiceRecord | null;
    history: ServiceRecord[];
    loading: boolean;
    error: string | null;
}

export function useClientProfile(userId: string | undefined, clientId: string) {
    const [data, setData] = useState<SmartProfileData>({
        client: null,
        lastServiceSnapshot: null,
        history: [],
        loading: true,
        error: null
    });

    const calculateStats = (history: ServiceRecord[]): { stats: ClientStats, lifecycle: ClientLifecycle } => {
        if (history.length === 0) {
            return {
                stats: {
                    totalSpend: 0,
                    visitCount: 0,
                    averageTicket: 0,
                    averageTipPercent: 0,
                    noShowCount: 0,
                    cancellationCount: 0,
                    clientGrade: 'New'
                },
                lifecycle: {
                    avgIntervalDays: 0,
                    churnRisk: false
                }
            };
        }

        const totalSpend = history.reduce((sum, rec) => sum + (rec.price || 0), 0);
        const totalTips = history.reduce((sum, rec) => sum + (rec.tip || 0), 0);
        const visitCount = history.length;
        const averageTicket = totalSpend / visitCount;
        const averageTipPercent = totalSpend > 0 ? (totalTips / totalSpend) * 100 : 0;

        // Grading Logic
        let grade: ClientStats['clientGrade'] = 'C';
        if (averageTicket > 100 && averageTipPercent > 15) grade = 'A+';
        else if (averageTicket > 80 || averageTipPercent > 20) grade = 'A';
        else if (averageTicket > 50) grade = 'B';
        else if (averageTicket < 30) grade = 'D';

        // Interval Logic
        let avgIntervalDays = 0;
        let predictedNextVisit: Timestamp | undefined;
        let churnRisk = false;

        if (history.length > 1) {
            // Sort by date ascending for interval calc
            const sorted = [...history].sort((a, b) => a.date.seconds - b.date.seconds);
            const first = sorted[0].date.seconds;
            const last = sorted[sorted.length - 1].date.seconds;
            const daysDiff = (last - first) / (24 * 60 * 60);
            avgIntervalDays = daysDiff / (visitCount - 1);

            // Predict next
            const lastVisitDate = new Date(last * 1000);
            const nextDate = new Date(lastVisitDate);
            nextDate.setDate(nextDate.getDate() + Math.round(avgIntervalDays));
            predictedNextVisit = Timestamp.fromDate(nextDate);

            // Churn Risk
            const daysSinceLast = (Date.now() / 1000 - last) / (24 * 60 * 60);
            if (daysSinceLast > (avgIntervalDays * 1.5) && daysSinceLast > 21) {
                churnRisk = true;
            }
        }

        return {
            stats: {
                totalSpend,
                visitCount,
                averageTicket,
                averageTipPercent,
                noShowCount: 0, // Placeholder - needs specific tracking
                cancellationCount: 0, // Placeholder
                clientGrade: grade,
                firstVisitDate: history[history.length - 1].date, // Desc order
                lastVisitDate: history[0].date
            },
            lifecycle: {
                avgIntervalDays,
                predictedNextVisit,
                churnRisk
            }
        };
    };

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
            // Note: Assuming 'service_records' is a subcollection or a root collection query
            // For now, let's assume root collection 'service_records' for scalability, indexed by clientId
            const historyRef = collection(db, 'service_records');
            const q = query(
                historyRef,
                where('clientId', '==', clientId),
                orderBy('date', 'desc')
            );
            const historySnap = await getDocs(q);
            const history = historySnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as ServiceRecord));

            // 3. Smart Construction (Calculate derived stats)
            const { stats, lifecycle } = calculateStats(history);

            // Merge calculated stats into client object for UI
            const smartClient: Client = {
                ...clientData,
                stats: { ...clientData.stats, ...stats }, // Prefer stored, fallback to calc? Or always calc? Let's overwrite for "Live" view
                lifecycle: { ...clientData.lifecycle, ...lifecycle }
            };

            setData({
                client: smartClient,
                lastServiceSnapshot: history.length > 0 ? history[0] : null,
                history,
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

'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import SmartQuoteView from '@/components/SmartQuoteView';
import type { MasterServiceMenu } from '@/types/serviceSchema';

export default function EmbedSmartQuote() {
    const params = useParams();
    const userId = params?.userId as string;
    const [menu, setMenu] = useState<MasterServiceMenu | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            if (!userId) {
                setError("No user ID provided");
                setLoading(false);
                return;
            }

            try {
                // Fetch Menu
                const menuDocRef = doc(db, 'serviceMenus', userId);
                const menuDoc = await getDoc(menuDocRef);

                if (menuDoc.exists()) {
                    setMenu(menuDoc.data() as MasterServiceMenu);
                } else {
                    setError("Menu not configured.");
                }

            } catch (err) {
                console.error("Error fetching public data:", err);
                setError("Failed to load.");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [userId]);

    if (loading) {
        return (
            <div className="h-full flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
            </div>
        );
    }

    if (error || !menu) {
        return (
            <div className="h-full flex flex-col items-center justify-center p-4 text-center">
                <p className="text-sm text-gray-500">{error || "Menu not found."}</p>
            </div>
        );
    }

    return (
        <div className="h-full bg-transparent">
            {/* We remove the header/footer for the embed view to keep it clean */}
            <SmartQuoteView
                menu={menu}
                isAuthenticated={false}
            />
        </div>
    );
}

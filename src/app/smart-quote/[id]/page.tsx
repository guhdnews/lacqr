'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import SmartQuoteView from '@/components/SmartQuoteView';
import type { MasterServiceMenu } from '@/types/serviceSchema';

export default function PublicSmartQuote() {
    const params = useParams();
    const userId = params?.id as string;
    const [menu, setMenu] = useState<MasterServiceMenu | null>(null);
    const [salonName, setSalonName] = useState<string>("");
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
                // Fetch User Profile (for Salon Name)
                const userDocRef = doc(db, 'users', userId);
                const userDoc = await getDoc(userDocRef);

                if (userDoc.exists()) {
                    setSalonName(userDoc.data().name || "The Salon");
                } else {
                    setSalonName("The Salon");
                }

                // Fetch Menu
                const menuDocRef = doc(db, 'serviceMenus', userId);
                const menuDoc = await getDoc(menuDocRef);

                if (menuDoc.exists()) {
                    setMenu(menuDoc.data() as MasterServiceMenu);
                } else {
                    setError("This technician hasn't set up their menu yet.");
                }

            } catch (err) {
                console.error("Error fetching public data:", err);
                setError("Failed to load technician data.");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [userId]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
            </div>
        );
    }

    if (error || !menu) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4 text-center">
                <h2 className="text-xl font-bold text-gray-800 mb-2">Oops!</h2>
                <p className="text-gray-600">{error || "Menu not found."}</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4">
            <div className="max-w-md mx-auto mb-8 text-center">
                <h1 className="text-3xl font-bold text-gray-900">{salonName}</h1>
                <p className="text-gray-500 mt-1">Smart Quote Booking</p>
            </div>

            <SmartQuoteView
                menu={menu}
                isAuthenticated={false}
            />

            <div className="max-w-md mx-auto mt-8 text-center">
                <p className="text-xs text-gray-400">Powered by Lacqr</p>
            </div>
        </div>
    );
}

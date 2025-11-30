import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import SmartQuoteView from '../../components/SmartQuoteView';
import type { MasterServiceMenu } from '../../types/serviceSchema';

export default function PublicSmartQuote() {
    const { userId } = useParams<{ userId: string }>();
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
                // Note: We might need a 'profiles' collection if 'users' is restricted, 
                // but for now assuming we can read public fields if rules allow.
                // If 'users' is strictly private, we'll need to adjust rules or use a public profile collection.
                // For this implementation, we'll assume we can read the user doc or a public profile.
                // Let's try reading the user doc first.
                const userDocRef = doc(db, 'users', userId);
                const userDoc = await getDoc(userDocRef);

                if (userDoc.exists()) {
                    setSalonName(userDoc.data().name || "The Salon");
                } else {
                    // Fallback or handle not found
                    setSalonName("The Salon");
                }

                // Fetch Menu
                // The menu is stored in the root 'serviceMenus' collection with the user's ID
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

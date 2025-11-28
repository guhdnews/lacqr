import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { collection, getDocs, query, limit } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import SmartQuoteView from '../../components/SmartQuoteView';
import type { MasterServiceMenu } from '../../types/serviceSchema';

export default function EmbedSmartQuote() {
    const { userId } = useParams<{ userId: string }>();
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
                const menusRef = collection(db, 'users', userId, 'menus');
                const q = query(menusRef, limit(1));
                const menuSnapshot = await getDocs(q);

                if (!menuSnapshot.empty) {
                    setMenu(menuSnapshot.docs[0].data() as MasterServiceMenu);
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

import { useState, useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';
import { useServiceStore } from '../store/useServiceStore';
import type { Client } from '../types/client';
import type { ServiceSelection } from '../types/serviceSchema';
import { calculatePrice } from '../utils/pricingCalculator';
import SmartQuoteView from '../components/SmartQuoteView';

export default function SmartQuote() {
    const { menu } = useServiceStore();
    const { user } = useAppStore();
    const [clients, setClients] = useState<Client[]>([]);

    useEffect(() => {
        if (user && user.id) {
            const fetchClients = async () => {
                try {
                    const { collection, query, where, getDocs, orderBy } = await import('firebase/firestore');
                    const { db } = await import('../lib/firebase');
                    const q = query(
                        collection(db, 'clients'),
                        where('userId', '==', user.id),
                        orderBy('createdAt', 'desc')
                    );
                    const snapshot = await getDocs(q);
                    setClients(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Client)));
                } catch (error) {
                    console.error("Error fetching clients", error);
                }
            };
            fetchClients();
        }
    }, [user]);

    const handleShareQuote = async (result: ServiceSelection, clientId: string) => {
        if (!result) return;
        try {
            const { addDoc, collection, doc, updateDoc, arrayUnion } = await import('firebase/firestore');
            const { db } = await import('../lib/firebase');

            const totalPrice = calculatePrice(result, menu);

            const quoteData = {
                type: 'smart_quote',
                data: result,
                totalPrice: totalPrice,
                createdAt: new Date(),
                salonName: user?.name || "Your Salon",
                userId: user?.id,
                clientId: clientId || null,
                clientName: clientId ? clients.find(c => c.id === clientId)?.name : null,
                status: 'shared'
            };

            const docRef = await addDoc(collection(db, 'quotes'), quoteData);

            // If a client is selected, update their history
            if (clientId) {
                const clientRef = doc(db, 'clients', clientId);
                await updateDoc(clientRef, {
                    lastVisit: new Date(),
                    history: arrayUnion({
                        id: docRef.id,
                        date: new Date(),
                        service: "Smart Quote Analysis",
                        price: totalPrice.total,
                        notes: "Generated via Smart Quote"
                    })
                });
            }

            const url = `${window.location.origin}/q/${docRef.id}`;
            await navigator.clipboard.writeText(url);
            alert("Link copied to clipboard! Send it to your client.");
        } catch (error) {
            console.error("Error sharing quote:", error);
            alert("Failed to create share link.");
        }
    };

    return (
        <SmartQuoteView
            menu={menu}
            clients={clients}
            onShareQuote={handleShareQuote}
            isAuthenticated={true}
        />
    );
}

'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAppStore } from '@/store/useAppStore';
import { doc, getDoc, collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { ArrowLeft, Phone, Mail, Calendar, Clock, Edit, Trash2, MessageSquare } from 'lucide-react';
import { Client } from '@/types/client';

export default function ClientDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { user } = useAppStore();
    const clientId = params?.id as string;

    const [client, setClient] = useState<Client | null>(null);
    const [loading, setLoading] = useState(true);
    const [history, setHistory] = useState<any[]>([]);

    useEffect(() => {
        const fetchClientData = async () => {
            if (!user?.id || !clientId) return;

            try {
                // Fetch Client Details
                const clientRef = doc(db, 'users', user.id, 'clients', clientId);
                const clientSnap = await getDoc(clientRef);

                if (clientSnap.exists()) {
                    setClient({ id: clientSnap.id, ...clientSnap.data() } as Client);
                } else {
                    console.error("Client not found");
                    // router.push('/dashboard/crm'); // Optional: redirect if not found
                }

                // Fetch Client History (Quotes/Appointments)
                // Assuming we query 'quotes' where clientId matches
                const quotesRef = collection(db, 'quotes');
                const q = query(
                    quotesRef,
                    where('userId', '==', user.id),
                    where('clientId', '==', clientId),
                    orderBy('createdAt', 'desc')
                );
                const querySnapshot = await getDocs(q);
                const historyData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setHistory(historyData);

            } catch (error) {
                console.error("Error fetching client details:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchClientData();
    }, [user?.id, clientId, router]);

    if (loading) {
        return <div className="p-8 text-center text-gray-500">Loading client details...</div>;
    }

    if (!client) {
        return (
            <div className="p-8 text-center">
                <h2 className="text-xl font-bold text-gray-800">Client not found</h2>
                <button onClick={() => router.back()} className="text-pink-500 hover:underline mt-4">
                    Go Back
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-4 space-y-8 pb-20">
            {/* Header */}
            <div className="flex items-center space-x-4">
                <button
                    onClick={() => router.back()}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                    <ArrowLeft size={20} className="text-gray-600" />
                </button>
                <div>
                    <h1 className="text-3xl font-bold font-serif text-charcoal">{client.name}</h1>
                    <p className="text-gray-500 text-sm">Client since {client.createdAt ? new Date(client.createdAt.seconds * 1000).toLocaleDateString() : 'Unknown'}</p>
                </div>
            </div>

            {/* Contact Info Card */}
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm grid md:grid-cols-3 gap-6">
                <div className="flex items-center space-x-3 text-gray-600">
                    <div className="w-10 h-10 bg-pink-50 rounded-full flex items-center justify-center text-pink-500">
                        <Phone size={18} />
                    </div>
                    <div>
                        <p className="text-xs text-gray-400 uppercase font-bold">Phone</p>
                        <p className="font-medium">{client.phone || 'N/A'}</p>
                    </div>
                </div>
                <div className="flex items-center space-x-3 text-gray-600">
                    <div className="w-10 h-10 bg-purple-50 rounded-full flex items-center justify-center text-purple-500">
                        <Mail size={18} />
                    </div>
                    <div>
                        <p className="text-xs text-gray-400 uppercase font-bold">Email</p>
                        <p className="font-medium">{client.email || 'N/A'}</p>
                    </div>
                </div>
                <div className="flex items-center space-x-3 text-gray-600">
                    <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center text-blue-500">
                        <MessageSquare size={18} />
                    </div>
                    <div>
                        <p className="text-xs text-gray-400 uppercase font-bold">Instagram</p>
                        <p className="font-medium">{client.instagram || 'N/A'}</p>
                    </div>
                </div>
            </div>

            {/* Notes Section */}
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-charcoal">Notes & Preferences</h3>
                    <button className="text-sm text-pink-500 font-bold hover:underline flex items-center">
                        <Edit size={14} className="mr-1" /> Edit
                    </button>
                </div>
                <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-100 text-gray-700 leading-relaxed">
                    {client.notes || "No notes yet. Add preferences like 'Sensitive cuticles' or 'Loves glitter'."}
                </div>
            </div>

            {/* History Section */}
            <div className="space-y-4">
                <h3 className="text-xl font-bold text-charcoal px-2">Appointment History</h3>

                {history.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                        <p className="text-gray-500">No history found for this client.</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {history.map((item) => (
                            <div key={item.id} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex justify-between items-center hover:shadow-md transition-shadow">
                                <div className="flex items-center space-x-4">
                                    <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center text-gray-500">
                                        <Calendar size={20} />
                                    </div>
                                    <div>
                                        <p className="font-bold text-charcoal">
                                            {item.data?.base?.system || "Service"}
                                            {item.data?.art?.level ? ` + Level ${item.data.art.level} Art` : ''}
                                        </p>
                                        <div className="flex items-center text-xs text-gray-500 mt-1">
                                            <Clock size={12} className="mr-1" />
                                            {item.createdAt ? new Date(item.createdAt.seconds * 1000).toLocaleDateString() : 'Unknown Date'}
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-lg">${item.totalPrice || 0}</p>
                                    <span className={`text-xs px-2 py-1 rounded-full font-bold ${item.status === 'completed' ? 'bg-green-100 text-green-600' :
                                            item.status === 'pending' ? 'bg-amber-100 text-amber-600' : 'bg-gray-100 text-gray-500'
                                        }`}>
                                        {item.status || 'Draft'}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

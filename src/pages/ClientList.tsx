import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Loader2, X, Save, ChevronRight, Instagram, Phone } from 'lucide-react';
import { collection, getDocs, addDoc, query, where, orderBy, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { type Client } from '../types/client';
import { useAppStore } from '../store/useAppStore';

export default function ClientList() {
    const navigate = useNavigate();
    const { user } = useAppStore();
    const [clients, setClients] = useState<Client[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    // New Client Form State
    const [newClient, setNewClient] = useState({
        name: '',
        phone: '',
        instagram: '',
        notes: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (user) {
            fetchClients();
        }
    }, [user]);

    const fetchClients = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const q = query(
                collection(db, 'clients'),
                where('userId', '==', user.id)
            );

            const querySnapshot = await getDocs(q);
            const fetchedClients: Client[] = [];
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                fetchedClients.push({
                    id: doc.id,
                    ...data,
                    createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt),
                    lastVisit: data.lastVisit?.toDate ? data.lastVisit.toDate() : (data.lastVisit ? new Date(data.lastVisit) : undefined)
                } as Client);
            });

            // Client-side sort
            fetchedClients.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

            setClients(fetchedClients);
        } catch (error) {
            console.error("Error fetching clients:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddClient = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        setIsSubmitting(true);

        try {
            // Duplicate Check (by phone if provided)
            if (newClient.phone) {
                const q = query(
                    collection(db, 'clients'),
                    where("userId", "==", user.id),
                    where("phone", "==", newClient.phone)
                );
                const querySnapshot = await getDocs(q);

                if (!querySnapshot.empty) {
                    alert("A client with this phone number already exists.");
                    setIsSubmitting(false);
                    return;
                }
            }

            // Add Client
            const clientData = {
                userId: user.id,
                name: newClient.name,
                phone: newClient.phone,
                instagram: newClient.instagram,
                notes: newClient.notes,
                createdAt: serverTimestamp(),
                history: [],
                tags: ['New'],
                totalSpent: 0
            };

            const docRef = await addDoc(collection(db, 'clients'), clientData);

            // Optimistic update
            const addedClient = {
                id: docRef.id,
                ...clientData,
                createdAt: new Date(), // Approximation for UI
                history: [],
                tags: ['New'],
                totalSpent: 0
            } as unknown as Client;

            setClients([addedClient, ...clients]);
            setIsAddModalOpen(false);
            setNewClient({ name: '', phone: '', instagram: '', notes: '' });

            // Navigate to the new client's profile
            navigate(`/clients/${docRef.id}`);

        } catch (error) {
            console.error("Error adding client:", error);
            alert("Failed to add client. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const filteredClients = clients.filter(client =>
        client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (client.instagram && client.instagram.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (client.phone && client.phone.includes(searchTerm))
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Loader2 className="animate-spin text-pink-500" size={48} />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-8 pb-24">
            <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-3xl shadow-sm border border-pink-100 overflow-hidden">
                    <div className="p-6 border-b border-pink-50">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-serif font-bold text-charcoal">Clients</h2>
                            <button
                                onClick={() => setIsAddModalOpen(true)}
                                className="p-2 bg-pink-50 text-pink-600 rounded-xl hover:bg-pink-100 transition-colors"
                            >
                                <Plus size={20} />
                            </button>
                        </div>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text"
                                placeholder="Search by name, phone, or handle..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-gray-50 border-transparent rounded-xl focus:bg-white focus:border-pink-300 focus:ring-0 transition-all"
                            />
                        </div>
                    </div>

                    <div className="divide-y divide-gray-50">
                        {filteredClients.map(client => (
                            <button
                                key={client.id}
                                onClick={() => navigate(`/clients/${client.id}`)}
                                className="w-full p-4 flex items-center space-x-4 hover:bg-pink-50 transition-colors text-left"
                            >
                                <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center text-pink-500 font-bold text-lg">
                                    {client.avatar ? <img src={client.avatar} alt={client.name} className="w-full h-full rounded-full object-cover" /> : client.name.charAt(0).toUpperCase()}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-bold text-charcoal truncate">{client.name}</h3>
                                    <div className="flex items-center space-x-3 text-xs text-gray-400 mt-1">
                                        {client.instagram && (
                                            <div className="flex items-center">
                                                <Instagram size={12} className="mr-1" />
                                                <span className="truncate">{client.instagram}</span>
                                            </div>
                                        )}
                                        {client.phone && (
                                            <div className="flex items-center">
                                                <Phone size={12} className="mr-1" />
                                                <span>{client.phone}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <ChevronRight size={16} className="text-gray-300" />
                            </button>
                        ))}
                        {filteredClients.length === 0 && (
                            <div className="p-10 text-center">
                                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <Search size={32} className="text-gray-300" />
                                </div>
                                <p className="text-gray-500 font-medium">No clients found</p>
                                <p className="text-xs text-gray-400 mt-1">Tap + to add a new client</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Add Client Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="text-xl font-serif font-bold">Add New Client</h3>
                            <button onClick={() => setIsAddModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <X size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleAddClient} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Full Name</label>
                                <input
                                    type="text"
                                    required
                                    value={newClient.name}
                                    onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl bg-gray-50 border-transparent focus:bg-white focus:border-pink-500 focus:ring-0 transition-all"
                                    placeholder="e.g. Sarah Miller"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Phone</label>
                                    <input
                                        type="tel"
                                        value={newClient.phone}
                                        onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl bg-gray-50 border-transparent focus:bg-white focus:border-pink-500 focus:ring-0 transition-all"
                                        placeholder="(555) 123-4567"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Instagram</label>
                                    <input
                                        type="text"
                                        value={newClient.instagram}
                                        onChange={(e) => setNewClient({ ...newClient, instagram: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl bg-gray-50 border-transparent focus:bg-white focus:border-pink-500 focus:ring-0 transition-all"
                                        placeholder="@username"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Notes</label>
                                <textarea
                                    value={newClient.notes}
                                    onChange={(e) => setNewClient({ ...newClient, notes: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl bg-gray-50 border-transparent focus:bg-white focus:border-pink-500 focus:ring-0 transition-all h-24 resize-none"
                                    placeholder="Preferences, allergies, etc."
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full bg-charcoal text-white py-4 rounded-xl font-bold text-lg hover:bg-black transition-all flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? (
                                    <Loader2 className="animate-spin" />
                                ) : (
                                    <>
                                        <Save size={20} />
                                        <span>Save Client</span>
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

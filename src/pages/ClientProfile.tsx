import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Phone, Mail, Calendar, Clock, Loader2, ArrowLeft, Instagram, Edit } from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { MOCK_CLIENTS, type Client } from '../types/client';

export default function ClientProfile() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [client, setClient] = useState<Client | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchClient = async () => {
            if (!id) return;
            setLoading(true);
            try {
                const docRef = doc(db, 'clients', id);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const data = docSnap.data();
                    setClient({
                        id: docSnap.id,
                        ...data,
                        createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt),
                        lastVisit: data.lastVisit?.toDate ? data.lastVisit.toDate() : (data.lastVisit ? new Date(data.lastVisit) : undefined)
                    } as Client);
                } else {
                    // Fallback to mock data if not found in DB (for demo purposes)
                    const mockClient = MOCK_CLIENTS.find(c => c.id === id);
                    if (mockClient) {
                        setClient(mockClient);
                    } else {
                        console.error("Client not found");
                    }
                }
            } catch (error) {
                console.error("Error fetching client:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchClient();
    }, [id]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Loader2 className="animate-spin text-pink-500" size={48} />
            </div>
        );
    }

    if (!client) {
        return (
            <div className="flex flex-col items-center justify-center h-screen text-gray-500">
                <p className="mb-4">Client not found.</p>
                <button
                    onClick={() => navigate('/clients')}
                    className="text-pink-600 font-bold hover:underline"
                >
                    Back to Clients
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-8 pb-24">
            <div className="max-w-4xl mx-auto">
                <button
                    onClick={() => navigate('/clients')}
                    className="flex items-center text-gray-500 hover:text-charcoal mb-6 transition-colors"
                >
                    <ArrowLeft size={20} className="mr-2" />
                    Back to Clients
                </button>

                <div className="bg-white rounded-3xl shadow-sm border border-pink-100 overflow-hidden">
                    <div className="p-6 border-b border-pink-50 flex flex-col md:flex-row justify-between items-start md:items-center bg-pink-50/30 gap-4">
                        <div className="flex items-center space-x-4">
                            <div className="w-20 h-20 bg-pink-100 rounded-full flex items-center justify-center text-pink-600 font-bold text-3xl">
                                {client.avatar ? <img src={client.avatar} alt={client.name} className="w-full h-full rounded-full object-cover" /> : client.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <h1 className="text-3xl font-serif font-bold text-charcoal">{client.name}</h1>
                                <div className="flex items-center space-x-2 mt-1">
                                    {client.tags && client.tags.map(tag => (
                                        <span key={tag} className="px-2 py-1 bg-white border border-pink-100 rounded-full text-xs font-bold text-pink-600 uppercase tracking-wide">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="text-right hidden md:block">
                            <p className="text-sm text-gray-500">Total Spent</p>
                            <p className="text-2xl font-bold text-charcoal">${client.totalSpent || 0}</p>
                        </div>
                    </div>

                    <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="space-y-8 col-span-1">
                            <div className="space-y-4">
                                <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                                    <h3 className="font-bold text-gray-900">Contact Info</h3>
                                    <button className="text-gray-400 hover:text-pink-500">
                                        <Edit size={16} />
                                    </button>
                                </div>

                                {client.phone && (
                                    <div className="flex items-center space-x-3 text-gray-600">
                                        <Phone size={18} />
                                        <span>{client.phone}</span>
                                    </div>
                                )}
                                {client.instagram && (
                                    <div className="flex items-center space-x-3 text-gray-600">
                                        <Instagram size={18} />
                                        <a href={`https://instagram.com/${client.instagram.replace('@', '')}`} target="_blank" rel="noreferrer" className="hover:text-pink-600 hover:underline">
                                            {client.instagram}
                                        </a>
                                    </div>
                                )}
                                {client.email && (
                                    <div className="flex items-center space-x-3 text-gray-600">
                                        <Mail size={18} />
                                        <span className="truncate">{client.email}</span>
                                    </div>
                                )}
                                <div className="flex items-center space-x-3 text-gray-600">
                                    <Calendar size={18} />
                                    <span>Joined {new Date(client.createdAt).toLocaleDateString()}</span>
                                </div>
                            </div>

                            <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-100">
                                <h4 className="font-bold text-yellow-800 mb-2 text-sm uppercase tracking-wide">Notes</h4>
                                <p className="text-sm text-yellow-900 leading-relaxed whitespace-pre-wrap">
                                    {client.notes || "No notes yet."}
                                </p>
                            </div>
                        </div>

                        <div className="col-span-1 md:col-span-2 space-y-6">
                            <h3 className="font-bold text-lg flex items-center border-b border-gray-100 pb-2">
                                <Clock size={20} className="mr-2 text-pink-500" />
                                Visit History
                            </h3>
                            <div className="space-y-4">
                                {client.history && client.history.length > 0 ? (
                                    client.history.map(visit => (
                                        <div key={visit.id} className="flex items-start justify-between p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-pink-200 transition-colors">
                                            <div>
                                                <p className="font-bold text-charcoal">{visit.service}</p>
                                                <p className="text-sm text-gray-500">{new Date(visit.date).toLocaleDateString()}</p>
                                                {visit.notes && <p className="text-sm text-gray-600 mt-2 italic">"{visit.notes}"</p>}
                                            </div>
                                            <span className="font-mono font-bold text-gray-900">${visit.price}</span>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-gray-400 text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                        No history yet.
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

import React, { useState, useEffect } from 'react';
import { X, UserPlus, Search, Check, User } from 'lucide-react';
import { collection, addDoc, getDocs, query, where, orderBy, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { Client } from '../types/client';
import { useAppStore } from '../store/useAppStore';

interface ClientModalProps {
    isOpen: boolean;
    mode: 'create' | 'assign';
    onClose: () => void;
    onClientSelected: (client: Client) => void;
}

export default function ClientModal({ isOpen, mode, onClose, onClientSelected }: ClientModalProps) {
    const { user } = useAppStore();
    const [activeMode, setActiveMode] = useState<'create' | 'assign'>(mode);

    // Create Mode State
    const [newClientName, setNewClientName] = useState('');
    const [newClientPhone, setNewClientPhone] = useState('');
    const [newClientEmail, setNewClientEmail] = useState('');
    const [isCreating, setIsCreating] = useState(false);

    // Assign Mode State
    const [clients, setClients] = useState<Client[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoadingClients, setIsLoadingClients] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setActiveMode(mode);
            if (mode === 'assign') {
                fetchClients();
            }
        }
    }, [isOpen, mode]);

    const fetchClients = async () => {
        if (!user?.id) return;
        setIsLoadingClients(true);
        try {
            const q = query(
                collection(db, 'clients'),
                where('userId', '==', user.id)
            );
            const snapshot = await getDocs(q);
            const fetchedClients = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Client));
            // Sort client-side to avoid index requirement
            fetchedClients.sort((a, b) => {
                const dateA = a.createdAt?.seconds || 0;
                const dateB = b.createdAt?.seconds || 0;
                return dateB - dateA;
            });
            setClients(fetchedClients);
        } catch (error) {
            console.error("Error fetching clients:", error);
        } finally {
            setIsLoadingClients(false);
        }
    };

    const handleCreateClient = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newClientName.trim() || !user?.id) return;

        setIsCreating(true);
        try {
            const clientData = {
                userId: user.id,
                name: newClientName,
                phone: newClientPhone,
                email: newClientEmail,
                createdAt: serverTimestamp(),
                lastVisit: serverTimestamp(),
                history: [],
                preferences: {
                    notes: '',
                    allergies: []
                }
            };

            const docRef = await addDoc(collection(db, 'clients'), clientData);
            const newClient = { id: docRef.id, ...clientData } as Client; // Optimistic update

            onClientSelected(newClient);
            onClose();

            // Reset form
            setNewClientName('');
            setNewClientPhone('');
            setNewClientEmail('');
        } catch (error) {
            console.error("Error creating client:", error);
            alert("Failed to create client.");
        } finally {
            setIsCreating(false);
        }
    };

    const filteredClients = clients.filter(c =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.phone?.includes(searchQuery) ||
        c.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-100">
                    <h3 className="font-bold text-lg text-gray-900">
                        {activeMode === 'create' ? 'New Client' : 'Select Client'}
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X size={20} />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex p-1 bg-gray-50 border-b border-gray-100">
                    <button
                        onClick={() => setActiveMode('assign')}
                        className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${activeMode === 'assign' ? 'bg-white shadow text-pink-600' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Existing Client
                    </button>
                    <button
                        onClick={() => setActiveMode('create')}
                        className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${activeMode === 'create' ? 'bg-white shadow text-pink-600' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Create New
                    </button>
                </div>

                {/* Content */}
                <div className="p-4">
                    {activeMode === 'create' ? (
                        <form onSubmit={handleCreateClient} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Name</label>
                                <input
                                    type="text"
                                    required
                                    value={newClientName}
                                    onChange={(e) => setNewClientName(e.target.value)}
                                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500"
                                    placeholder="Jane Doe"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Phone (Optional)</label>
                                <input
                                    type="tel"
                                    value={newClientPhone}
                                    onChange={(e) => setNewClientPhone(e.target.value)}
                                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500"
                                    placeholder="(555) 123-4567"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Email (Optional)</label>
                                <input
                                    type="email"
                                    value={newClientEmail}
                                    onChange={(e) => setNewClientEmail(e.target.value)}
                                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500"
                                    placeholder="jane@example.com"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={isCreating || !newClientName}
                                className="w-full py-3 bg-pink-600 hover:bg-pink-700 text-white font-bold rounded-xl shadow-lg shadow-pink-200 transition-all disabled:opacity-50 disabled:shadow-none flex items-center justify-center gap-2"
                            >
                                {isCreating ? 'Creating...' : <><UserPlus size={18} /> Create Client</>}
                            </button>
                        </form>
                    ) : (
                        <div className="space-y-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-pink-500"
                                    placeholder="Search clients..."
                                />
                            </div>

                            <div className="h-64 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                                {isLoadingClients ? (
                                    <div className="text-center py-8 text-gray-400">Loading clients...</div>
                                ) : filteredClients.length === 0 ? (
                                    <div className="text-center py-8 text-gray-400">
                                        <p>No clients found.</p>
                                        <button
                                            onClick={() => setActiveMode('create')}
                                            className="text-pink-600 font-bold mt-2 hover:underline"
                                        >
                                            Create New Client
                                        </button>
                                    </div>
                                ) : (
                                    filteredClients.map(client => (
                                        <button
                                            key={client.id}
                                            onClick={() => {
                                                onClientSelected(client);
                                                onClose();
                                            }}
                                            className="w-full flex items-center justify-between p-3 hover:bg-pink-50 rounded-xl transition-colors group text-left"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 group-hover:bg-pink-100 group-hover:text-pink-600 transition-colors">
                                                    <User size={20} />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-900">{client.name}</p>
                                                    <p className="text-xs text-gray-500">{client.phone || client.email || 'No contact info'}</p>
                                                </div>
                                            </div>
                                            <div className="opacity-0 group-hover:opacity-100 text-pink-600 transition-opacity">
                                                <Check size={20} />
                                            </div>
                                        </button>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

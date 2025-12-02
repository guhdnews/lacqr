'use client';

import { useState, useEffect } from 'react';
import { collection, query, getDocs, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAppStore } from '@/store/useAppStore';
import { Plus, Search, User, Phone, Mail, ChevronRight, Loader2, Calendar } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import ClientModal from '@/components/ClientModal';

interface Client {
    id: string;
    name: string;
    phone: string;
    email: string;
    createdAt: any;
    lastVisit?: any;
}

export default function ClientList() {
    const { user } = useAppStore();
    const router = useRouter();
    const [clients, setClients] = useState<Client[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        const fetchClients = async () => {
            if (!user.id) return;
            try {
                const q = query(collection(db, 'users', user.id, 'clients'), orderBy('name'));
                const querySnapshot = await getDocs(q);
                const clientData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Client));
                setClients(clientData);
            } catch (error) {
                console.error("Error fetching clients:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchClients();
    }, [user.id]);

    const handleClientCreated = (newClient: any) => {
        setClients(prev => [...prev, newClient].sort((a, b) => a.name.localeCompare(b.name)));
        // Optional: Navigate to profile immediately? 
        // router.push(`/dashboard/clients/${newClient.id}`);
    };

    const filteredClients = clients.filter(client =>
        client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.phone?.includes(searchTerm)
    );

    return (
        <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-charcoal font-display">Clients</h1>
                    <p className="text-gray-600">Manage your client relationships.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-charcoal text-white px-4 py-2 rounded-xl font-bold flex items-center hover:bg-black transition-colors"
                >
                    <Plus size={20} className="mr-2" />
                    Add Client
                </button>
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                    type="text"
                    placeholder="Search by name or phone..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 rounded-xl border-transparent bg-white shadow-sm focus:border-pink-500 focus:ring-0"
                />
            </div>

            {/* Client List */}
            {loading ? (
                <div className="flex justify-center py-12">
                    <Loader2 className="animate-spin text-gray-400" size={32} />
                </div>
            ) : filteredClients.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                    <User size={48} className="mx-auto text-gray-300 mb-4" />
                    <h3 className="text-lg font-bold text-gray-500">No clients found</h3>
                    <p className="text-gray-400">Add your first client to get started.</p>
                </div>
            ) : (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="grid grid-cols-12 gap-4 p-4 border-b border-gray-100 bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wider">
                        <div className="col-span-5 md:col-span-4">Name</div>
                        <div className="col-span-4 md:col-span-3 hidden md:block">Contact</div>
                        <div className="col-span-4 md:col-span-3 hidden md:block">Last Visit</div>
                        <div className="col-span-7 md:col-span-2 text-right">Action</div>
                    </div>
                    <div className="divide-y divide-gray-50">
                        {filteredClients.map((client) => (
                            <div
                                key={client.id}
                                onClick={() => router.push(`/dashboard/clients/${client.id}`)}
                                className="grid grid-cols-12 gap-4 p-4 hover:bg-gray-50 transition-colors cursor-pointer items-center group"
                            >
                                <div className="col-span-5 md:col-span-4 flex items-center space-x-3">
                                    <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center text-pink-600 font-bold text-sm flex-shrink-0">
                                        {client.name.charAt(0)}
                                    </div>
                                    <span className="font-bold text-charcoal truncate">{client.name}</span>
                                </div>

                                <div className="col-span-4 md:col-span-3 hidden md:block text-sm text-gray-500">
                                    <div className="flex flex-col space-y-1">
                                        {client.phone && (
                                            <span className="flex items-center"><Phone size={12} className="mr-1" /> {client.phone}</span>
                                        )}
                                        {client.email && (
                                            <span className="flex items-center"><Mail size={12} className="mr-1" /> {client.email}</span>
                                        )}
                                    </div>
                                </div>

                                <div className="col-span-4 md:col-span-3 hidden md:block text-sm text-gray-500">
                                    {client.lastVisit ? (
                                        <span className="flex items-center text-charcoal">
                                            <Calendar size={14} className="mr-2 text-gray-400" />
                                            {client.lastVisit.toDate ? format(client.lastVisit.toDate(), 'MMM d, yyyy') : 'Unknown'}
                                        </span>
                                    ) : (
                                        <span className="text-gray-400 italic">Never</span>
                                    )}
                                </div>

                                <div className="col-span-7 md:col-span-2 flex justify-end">
                                    <ChevronRight size={20} className="text-gray-300 group-hover:text-pink-500 transition-colors" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <ClientModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                mode="create"
                onClientSelected={handleClientCreated}
            />
        </div>
    );
}

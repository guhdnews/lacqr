import { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAppStore } from '../store/useAppStore';
import { X, Loader2 } from 'lucide-react';

interface ClientModalProps {
    isOpen: boolean;
    onClose: () => void;
    mode: 'create' | 'edit' | 'assign';
    onClientSelected?: (client: any) => void;
}

export default function ClientModal({ isOpen, onClose, mode, onClientSelected }: ClientModalProps) {
    const { user } = useAppStore();

    // Client Selection State
    const [clients, setClients] = useState<any[]>([]);
    const [loadingClients, setLoadingClients] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    // New Client Form State
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [submitting, setSubmitting] = useState(false);

    // Fetch clients when mode is 'assign'
    useEffect(() => {
        if (isOpen && mode === 'assign' && user.id) {
            const fetchClients = async () => {
                setLoadingClients(true);
                try {
                    const q = query(collection(db, 'users', user.id!, 'clients'), orderBy('createdAt', 'desc'));
                    const snapshot = await getDocs(q);
                    const clientList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                    setClients(clientList);
                } catch (error) {
                    console.error("Error fetching clients:", error);
                } finally {
                    setLoadingClients(false);
                }
            };
            fetchClients();
        }
    }, [isOpen, mode, user.id]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user.id) return;
        setSubmitting(true);

        try {
            const newClient = {
                name,
                phone,
                email,
                notes: '',
                createdAt: new Date()
            };

            const docRef = await addDoc(collection(db, 'users', user.id, 'clients'), newClient);

            if (onClientSelected) {
                onClientSelected({ id: docRef.id, ...newClient });
            }

            // Reset and close
            setName('');
            setPhone('');
            setEmail('');
            onClose();
        } catch (error) {
            console.error("Error adding client:", error);
            alert("Failed to add client.");
        } finally {
            setSubmitting(false);
        }
    };

    const filteredClients = clients.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.phone && c.phone.includes(searchTerm))
    );

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl w-full max-w-md p-6 space-y-6 animate-in fade-in zoom-in-95 duration-200 shadow-xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-charcoal">
                        {mode === 'assign' ? 'Select Client' : 'Add New Client'}
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-charcoal transition-colors">
                        <X size={24} />
                    </button>
                </div>

                {mode === 'assign' ? (
                    <div className="space-y-4">
                        <input
                            type="text"
                            placeholder="Search clients..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-pink-500 focus:ring-0 bg-gray-50"
                            autoFocus
                        />

                        {loadingClients ? (
                            <div className="flex justify-center py-8"><Loader2 className="animate-spin text-pink-500" /></div>
                        ) : (
                            <div className="space-y-2 max-h-60 overflow-y-auto">
                                {filteredClients.length === 0 ? (
                                    <p className="text-center text-gray-500 py-4">No clients found.</p>
                                ) : (
                                    filteredClients.map(client => (
                                        <button
                                            key={client.id}
                                            onClick={() => onClientSelected && onClientSelected(client)}
                                            className="w-full text-left p-3 rounded-xl hover:bg-pink-50 transition-colors border border-gray-100 flex justify-between items-center group"
                                        >
                                            <div>
                                                <p className="font-bold text-gray-900">{client.name}</p>
                                                <p className="text-xs text-gray-500">{client.phone || client.email}</p>
                                            </div>
                                            <div className="w-2 h-2 rounded-full bg-pink-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </button>
                                    ))
                                )}
                            </div>
                        )}

                        <div className="pt-2 border-t border-gray-100">
                            <button
                                onClick={() => {
                                    alert("To create a new client, close this modal and click 'New Client' in the menu.");
                                }}
                                className="w-full py-3 text-pink-600 font-bold hover:bg-pink-50 rounded-xl transition-colors"
                            >
                                + Create New Client
                            </button>
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Name</label>
                            <input
                                type="text"
                                required
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-pink-500 focus:ring-0 bg-gray-50 focus:bg-white transition-colors"
                                placeholder="e.g. Sarah Johnson"
                                autoFocus
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Phone</label>
                            <input
                                type="tel"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-pink-500 focus:ring-0 bg-gray-50 focus:bg-white transition-colors"
                                placeholder="(555) 123-4567"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-pink-500 focus:ring-0 bg-gray-50 focus:bg-white transition-colors"
                                placeholder="sarah@example.com"
                            />
                        </div>

                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full bg-charcoal text-white py-3 rounded-xl font-bold hover:bg-black transition-colors flex items-center justify-center disabled:opacity-70"
                            >
                                {submitting ? <Loader2 className="animate-spin" /> : 'Create Client'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}

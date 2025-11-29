import { useState } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAppStore } from '../store/useAppStore';
import { X, Loader2 } from 'lucide-react';

interface ClientModalProps {
    isOpen: boolean;
    onClose: () => void;
    mode: 'create' | 'edit' | 'assign'; // Future proofing
    onClientSelected?: (client: any) => void;
}

export default function ClientModal({ isOpen, onClose, onClientSelected }: ClientModalProps) {
    const { user } = useAppStore();
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [submitting, setSubmitting] = useState(false);

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

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl w-full max-w-md p-6 space-y-6 animate-in fade-in zoom-in-95 duration-200 shadow-xl">
                <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-charcoal">Add New Client</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-charcoal transition-colors">
                        <X size={24} />
                    </button>
                </div>

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
            </div>
        </div>
    );
}

import { useState, useEffect } from 'react';
import { collection, query, orderBy, addDoc, deleteDoc, updateDoc, doc, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAppStore } from '../store/useAppStore';
import { MessageSquare, Phone, StickyNote, Mail, Plus, Trash2, Pencil } from 'lucide-react';
import { format } from 'date-fns';

interface Interaction {
    id: string;
    type: 'note' | 'call' | 'text' | 'email';
    content: string;
    date: any;
}

interface InteractionHistoryProps {
    clientId: string;
}

export default function InteractionHistory({ clientId }: InteractionHistoryProps) {
    const { user } = useAppStore();
    const [interactions, setInteractions] = useState<Interaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);

    // Edit State
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editContent, setEditContent] = useState('');
    const [editType, setEditType] = useState<Interaction['type']>('note');

    // New Interaction State
    const [newContent, setNewContent] = useState('');
    const [newType, setNewType] = useState<Interaction['type']>('note');

    useEffect(() => {
        if (!user?.id || !clientId) return;

        const q = query(
            collection(db, 'users', user.id, 'clients', clientId, 'interactions'),
            orderBy('date', 'desc')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Interaction[];
            setInteractions(data);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user?.id, clientId]);

    const handleAdd = async () => {
        if (!newContent.trim() || !user?.id) return;

        try {
            await addDoc(collection(db, 'users', user.id, 'clients', clientId, 'interactions'), {
                type: newType,
                content: newContent,
                date: serverTimestamp()
            });
            setNewContent('');
            setIsAdding(false);
        } catch (error) {
            console.error("Error adding interaction:", error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this interaction?") || !user?.id) return;
        try {
            await deleteDoc(doc(db, 'users', user.id, 'clients', clientId, 'interactions', id));
        } catch (error) {
            console.error("Error deleting interaction:", error);
        }
    };

    const startEditing = (interaction: Interaction) => {
        setEditingId(interaction.id);
        setEditContent(interaction.content);
        setEditType(interaction.type);
    };

    const handleSaveEdit = async () => {
        if (!editingId || !editContent.trim() || !user?.id) return;
        try {
            const docRef = doc(db, 'users', user.id, 'clients', clientId, 'interactions', editingId);
            await updateDoc(docRef, {
                content: editContent,
                type: editType
            });
            setEditingId(null);
            setEditContent('');
        } catch (error) {
            console.error("Error updating interaction:", error);
        }
    };

    const getIcon = (type: Interaction['type']) => {
        switch (type) {
            case 'call': return <Phone size={16} className="text-blue-500" />;
            case 'text': return <MessageSquare size={16} className="text-green-500" />;
            case 'email': return <Mail size={16} className="text-purple-500" />;
            default: return <StickyNote size={16} className="text-yellow-500" />;
        }
    };

    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                <h3 className="font-bold text-charcoal text-lg">Interaction History</h3>
                <button
                    onClick={() => setIsAdding(!isAdding)}
                    className="flex items-center gap-2 text-sm font-bold text-pink-600 hover:text-pink-700 transition-colors"
                >
                    <Plus size={16} />
                    Log Interaction
                </button>
            </div>

            {isAdding && (
                <div className="p-4 bg-gray-50 border-b border-gray-100 animate-in slide-in-from-top-2">
                    <div className="flex gap-2 mb-3">
                        {(['note', 'call', 'text', 'email'] as const).map(type => (
                            <button
                                key={type}
                                onClick={() => setNewType(type)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${newType === type
                                    ? 'bg-white text-charcoal shadow-sm ring-1 ring-gray-200'
                                    : 'text-gray-500 hover:bg-gray-200'
                                    }`}
                            >
                                {type}
                            </button>
                        ))}
                    </div>
                    <textarea
                        value={newContent}
                        onChange={(e) => setNewContent(e.target.value)}
                        placeholder={`Add details about this ${newType}...`}
                        className="w-full p-3 rounded-xl border border-gray-200 text-sm focus:border-pink-500 focus:ring-0 mb-3"
                        rows={3}
                    />
                    <div className="flex justify-end gap-2">
                        <button
                            onClick={() => setIsAdding(false)}
                            className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleAdd}
                            disabled={!newContent.trim()}
                            className="px-4 py-2 bg-charcoal text-white rounded-lg text-sm font-bold hover:bg-black transition-colors disabled:opacity-50"
                        >
                            Save Log
                        </button>
                    </div>
                </div>
            )}

            <div className="divide-y divide-gray-50 max-h-[500px] overflow-y-auto">
                {loading ? (
                    <div className="p-8 text-center text-gray-400">Loading history...</div>
                ) : interactions.length === 0 ? (
                    <div className="p-8 text-center text-gray-400 text-sm">
                        No interactions logged yet.
                    </div>
                ) : (
                    interactions.map((item) => (
                        <div key={item.id} className="p-4 hover:bg-gray-50 transition-colors group">
                            <div className="flex items-start gap-3">
                                <div className="mt-1 p-2 bg-gray-100 rounded-full">
                                    {getIcon(item.type)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start">
                                        <p className="text-xs font-bold text-gray-500 uppercase mb-0.5">
                                            {item.type} • {item.date ? format(item.date.toDate(), 'MMM d, h:mm a') : 'Just now'}
                                        </p>
                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                                            <button
                                                onClick={() => startEditing(item)}
                                                className="text-gray-300 hover:text-blue-500 p-1"
                                            >
                                                <Pencil size={14} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(item.id)}
                                                className="text-gray-300 hover:text-red-500 p-1"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </div>

                                    {editingId === item.id ? (
                                        <div className="mt-2">
                                            <div className="flex gap-2 mb-2">
                                                {(['note', 'call', 'text', 'email'] as const).map(type => (
                                                    <button
                                                        key={type}
                                                        onClick={() => setEditType(type)}
                                                        className={`px-2 py-1 rounded text-xs font-bold capitalize transition-all ${editType === type
                                                            ? 'bg-charcoal text-white'
                                                            : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                                                            }`}
                                                    >
                                                        {type}
                                                    </button>
                                                ))}
                                            </div>
                                            <textarea
                                                value={editContent}
                                                onChange={(e) => setEditContent(e.target.value)}
                                                className="w-full p-2 rounded-lg border border-gray-200 text-sm focus:border-pink-500 focus:ring-0 mb-2"
                                                rows={3}
                                            />
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => setEditingId(null)}
                                                    className="text-xs font-medium text-gray-500 hover:text-gray-700"
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    onClick={handleSaveEdit}
                                                    className="px-3 py-1 bg-charcoal text-white rounded-md text-xs font-bold hover:bg-black"
                                                >
                                                    Save
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="text-gray-800 text-sm whitespace-pre-wrap">{item.content}</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

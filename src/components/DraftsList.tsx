import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, orderBy, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAppStore } from '../store/useAppStore';
import { FileText, Trash2, ArrowRight, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface DraftQuote {
    id: string;
    totalPrice: { total: number };
    createdAt: any;
    data: any; // ServiceSelection
    clientName?: string;
}

export default function DraftsList() {
    const { user } = useAppStore();
    const [drafts, setDrafts] = useState<DraftQuote[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchDrafts = async () => {
            if (!user?.id) return;

            try {
                const q = query(
                    collection(db, 'quotes'),
                    where('userId', '==', user.id),
                    where('status', '==', 'draft'),
                    orderBy('createdAt', 'desc')
                );

                const snapshot = await getDocs(q);
                const fetchedDrafts = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                })) as DraftQuote[];

                setDrafts(fetchedDrafts);
            } catch (error) {
                console.error("Error fetching drafts:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDrafts();
    }, [user]);

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm("Are you sure you want to delete this draft?")) return;

        try {
            await deleteDoc(doc(db, 'quotes', id));
            setDrafts(prev => prev.filter(d => d.id !== id));
        } catch (error) {
            console.error("Error deleting draft:", error);
            alert("Failed to delete draft.");
        }
    };

    const handleResume = (draft: DraftQuote) => {
        // Navigate to Lacqr Lens with state
        // We need to modify LacqrLens to accept initial state via location.state
        navigate('/lacqr-lens', { state: { initialSelection: draft.data } });
    };

    if (loading) return <div className="p-4 text-center text-gray-500">Loading drafts...</div>;

    if (drafts.length === 0) {
        return (
            <div className="text-center p-8 bg-gray-50 rounded-xl border border-gray-100">
                <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <h3 className="text-gray-900 font-medium">No Drafts Found</h3>
                <p className="text-sm text-gray-500 mt-1">Saved quotes will appear here.</p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {drafts.map(draft => (
                <div
                    key={draft.id}
                    onClick={() => handleResume(draft)}
                    className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all cursor-pointer group flex justify-between items-center"
                >
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="font-bold text-gray-900">
                                {draft.data.base.system} {draft.data.base.isFill ? 'Fill' : 'Set'}
                            </span>
                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                                ${draft.totalPrice.total}
                            </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                            <Clock size={12} />
                            <span>{new Date(draft.createdAt.seconds * 1000).toLocaleDateString()}</span>
                            {draft.clientName && (
                                <span className="text-pink-500 font-medium">• {draft.clientName}</span>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={(e) => handleDelete(draft.id, e)}
                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                            <Trash2 size={16} />
                        </button>
                        <div className="p-2 text-gray-300 group-hover:text-pink-500 transition-colors">
                            <ArrowRight size={20} />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

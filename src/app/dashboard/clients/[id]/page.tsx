'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { doc, getDoc, updateDoc, deleteDoc, collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Client } from '@/types/client';
import type { Appointment } from '@/types/appointment';
import { ArrowLeft, Phone, Mail, Edit2, Save, Instagram, Gift, StickyNote } from 'lucide-react';
import { format } from 'date-fns';
import InteractionHistory from '@/components/InteractionHistory';

export default function ClientProfile() {
    const params = useParams();
    const id = params?.id as string;
    const router = useRouter();
    const [client, setClient] = useState<Client | null>(null);
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'overview' | 'history' | 'interactions'>('overview');

    // Edit Mode State
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState<Partial<Client>>({});

    useEffect(() => {
        const fetchClientData = async () => {
            if (!id) return;
            try {
                // Fetch Client
                const clientDoc = await getDoc(doc(db, 'clients', id));
                if (clientDoc.exists()) {
                    const clientData = { id: clientDoc.id, ...clientDoc.data() } as Client;
                    setClient(clientData);
                    setEditForm(clientData);

                    // Fetch Appointments
                    const q = query(
                        collection(db, 'appointments'),
                        where('clientId', '==', id),
                        orderBy('date', 'desc')
                    );
                    const apptSnap = await getDocs(q);
                    const appts = apptSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Appointment));
                    setAppointments(appts);
                }
            } catch (error) {
                console.error("Error fetching client data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchClientData();
    }, [id]);

    const handleSave = async () => {
        if (!id || !editForm) return;
        try {
            await updateDoc(doc(db, 'clients', id), editForm);
            setClient(prev => ({ ...prev!, ...editForm }));
            setIsEditing(false);
        } catch (error) {
            console.error("Error updating client:", error);
            alert("Failed to update client.");
        }
    };

    if (loading) return <div className="p-8">Loading...</div>;
    if (!client) return <div className="p-8">Client not found.</div>;

    return (
        <div className="max-w-5xl mx-auto p-6 space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <button onClick={() => router.push('/dashboard/clients')} className="flex items-center text-gray-500 hover:text-charcoal transition-colors">
                    <ArrowLeft size={20} className="mr-2" />
                    Back to Clients
                </button>
                <div className="flex space-x-3">
                    {isEditing ? (
                        <>
                            <button onClick={() => setIsEditing(false)} className="px-4 py-2 text-gray-600 font-bold hover:bg-gray-100 rounded-lg transition-colors">
                                Cancel
                            </button>
                            <button onClick={handleSave} className="px-4 py-2 bg-charcoal text-white font-bold rounded-lg hover:bg-black transition-colors flex items-center">
                                <Save size={18} className="mr-2" /> Save
                            </button>
                        </>
                    ) : (
                        <button onClick={() => setIsEditing(true)} className="px-4 py-2 border border-gray-200 text-charcoal font-bold rounded-lg hover:bg-gray-50 transition-colors flex items-center">
                            <Edit2 size={18} className="mr-2" /> Edit Profile
                        </button>
                    )}
                </div>
            </div>

            {/* Profile Card */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
                <div className="flex flex-col md:flex-row gap-8">
                    {/* Avatar */}
                    <div className="flex-shrink-0">
                        <div className="w-32 h-32 bg-pink-100 rounded-full flex items-center justify-center text-4xl font-black text-pink-500">
                            {client.name.charAt(0)}
                        </div>
                    </div>

                    {/* Info */}
                    <div className="flex-1 space-y-6">
                        <div>
                            <h1 className="text-3xl font-black text-charcoal mb-2">{client.name}</h1>
                            <div className="flex flex-wrap gap-4 text-gray-500 text-sm">
                                <div className="flex items-center">
                                    <Phone size={16} className="mr-2" />
                                    {isEditing ? (
                                        <input
                                            value={editForm.phone || ''}
                                            onChange={e => setEditForm({ ...editForm, phone: e.target.value })}
                                            className="border rounded px-2 py-1"
                                        />
                                    ) : (
                                        client.phone
                                    )}
                                </div>
                                <div className="flex items-center">
                                    <Mail size={16} className="mr-2" />
                                    {isEditing ? (
                                        <input
                                            value={editForm.email || ''}
                                            onChange={e => setEditForm({ ...editForm, email: e.target.value })}
                                            className="border rounded px-2 py-1"
                                        />
                                    ) : (
                                        client.email || 'No email'
                                    )}
                                </div>
                                <div className="flex items-center">
                                    <Instagram size={16} className="mr-2" />
                                    {isEditing ? (
                                        <input
                                            value={editForm.instagram || ''}
                                            onChange={e => setEditForm({ ...editForm, instagram: e.target.value })}
                                            className="border rounded px-2 py-1"
                                            placeholder="@username"
                                        />
                                    ) : (
                                        client.instagram || 'No Instagram'
                                    )}
                                </div>
                                <div className="flex items-center">
                                    <Gift size={16} className="mr-2" />
                                    {isEditing ? (
                                        <input
                                            type="date"
                                            value={editForm.dob || ''}
                                            onChange={e => setEditForm({ ...editForm, dob: e.target.value })}
                                            className="border rounded px-2 py-1"
                                        />
                                    ) : (
                                        client.dob ? format(new Date(client.dob), 'MMM d') : 'No birthday'
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-3 gap-4 border-t border-gray-100 pt-6">
                            <div>
                                <div className="text-sm text-gray-500 mb-1">Total Visits</div>
                                <div className="text-2xl font-bold text-charcoal">{appointments.length}</div>
                            </div>
                            <div>
                                <div className="text-sm text-gray-500 mb-1">Total Spent</div>
                                <div className="text-2xl font-bold text-charcoal">
                                    ${appointments.reduce((sum, appt) => sum + (appt.price || 0), 0)}
                                </div>
                            </div>
                            <div>
                                <div className="text-sm text-gray-500 mb-1">Client Since</div>
                                <div className="text-2xl font-bold text-charcoal">
                                    {client.createdAt ? format(new Date(client.createdAt), 'MMM yyyy') : 'N/A'}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex space-x-1 bg-gray-100 p-1 rounded-xl w-fit">
                <button
                    onClick={() => setActiveTab('overview')}
                    className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'overview' ? 'bg-white text-charcoal shadow-sm' : 'text-gray-500 hover:text-charcoal'}`}
                >
                    Overview
                </button>
                <button
                    onClick={() => setActiveTab('history')}
                    className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'history' ? 'bg-white text-charcoal shadow-sm' : 'text-gray-500 hover:text-charcoal'}`}
                >
                    History
                </button>
                <button
                    onClick={() => setActiveTab('interactions')}
                    className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'interactions' ? 'bg-white text-charcoal shadow-sm' : 'text-gray-500 hover:text-charcoal'}`}
                >
                    Interactions
                </button>
            </div>

            {/* Overview Tab */}
            {activeTab === 'overview' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <h3 className="font-bold text-charcoal mb-4 flex items-center">
                            <StickyNote size={20} className="mr-2 text-pink-500" /> Notes
                        </h3>
                        {isEditing ? (
                            <textarea
                                value={editForm.notes || ''}
                                onChange={e => setEditForm({ ...editForm, notes: e.target.value })}
                                className="w-full h-32 p-3 border rounded-xl focus:border-pink-500 focus:ring-0"
                                placeholder="Add client notes..."
                            />
                        ) : (
                            <p className="text-gray-600 whitespace-pre-wrap">{client.notes || "No notes available."}</p>
                        )}
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <h3 className="font-bold text-charcoal mb-4">Preferences</h3>
                        {client.preferences ? (
                            <div className="space-y-4">
                                <div>
                                    <span className="text-xs font-bold text-gray-400 uppercase">Shapes</span>
                                    <div className="flex flex-wrap gap-2 mt-1">
                                        {client.preferences.preferredShapes?.length > 0 ? (
                                            client.preferences.preferredShapes.map(s => (
                                                <span key={s} className="px-2 py-1 bg-pink-50 text-pink-700 text-xs rounded-md font-medium">{s}</span>
                                            ))
                                        ) : <span className="text-sm text-gray-400">None listed</span>}
                                    </div>
                                </div>
                                <div>
                                    <span className="text-xs font-bold text-gray-400 uppercase">Lengths</span>
                                    <div className="flex flex-wrap gap-2 mt-1">
                                        {client.preferences.preferredLengths?.length > 0 ? (
                                            client.preferences.preferredLengths.map(l => (
                                                <span key={l} className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-md font-medium">{l}</span>
                                            ))
                                        ) : <span className="text-sm text-gray-400">None listed</span>}
                                    </div>
                                </div>
                                <div>
                                    <span className="text-xs font-bold text-gray-400 uppercase">Colors</span>
                                    <div className="flex flex-wrap gap-2 mt-1">
                                        {client.preferences.favoriteColors?.length > 0 ? (
                                            client.preferences.favoriteColors.map(c => (
                                                <span key={c} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md font-medium">{c}</span>
                                            ))
                                        ) : <span className="text-sm text-gray-400">None listed</span>}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="p-4 bg-gray-50 rounded-xl text-sm text-gray-500 italic">
                                No preferences recorded yet.
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Delete Zone */}
            {isEditing && (
                <div className="border-t border-gray-200 pt-8 mt-8">
                    <h3 className="text-lg font-bold text-red-600 mb-2">Danger Zone</h3>
                    <div className="bg-red-50 border border-red-100 rounded-xl p-4 flex justify-between items-center">
                        <div>
                            <p className="font-bold text-red-900">Delete this client</p>
                            <p className="text-sm text-red-700">Once deleted, all data and history will be lost.</p>
                        </div>
                        <button
                            onClick={async () => {
                                if (confirm("Are you sure you want to delete this client? This cannot be undone.")) {
                                    try {
                                        await deleteDoc(doc(db, 'clients', id));
                                        router.push('/dashboard/clients');
                                    } catch (error) {
                                        console.error("Error deleting client:", error);
                                        alert("Failed to delete client.");
                                    }
                                }
                            }}
                            className="px-4 py-2 bg-white border border-red-200 text-red-600 font-bold rounded-lg hover:bg-red-100 transition-colors"
                        >
                            Delete Client
                        </button>
                    </div>
                </div>
            )}

            {/* History Tab */}
            {activeTab === 'history' && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="text-left py-4 px-6 text-xs font-bold text-gray-500 uppercase">Date</th>
                                <th className="text-left py-4 px-6 text-xs font-bold text-gray-500 uppercase">Service</th>
                                <th className="text-left py-4 px-6 text-xs font-bold text-gray-500 uppercase">Price</th>
                                <th className="text-left py-4 px-6 text-xs font-bold text-gray-500 uppercase">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {appointments.map(appt => (
                                <tr key={appt.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="py-4 px-6 text-sm text-gray-900 font-medium">
                                        {format(new Date(appt.date), 'MMM d, yyyy')}
                                    </td>
                                    <td className="py-4 px-6 text-sm text-gray-600">
                                        {appt.serviceName}
                                    </td>
                                    <td className="py-4 px-6 text-sm text-gray-900 font-bold">
                                        ${appt.price}
                                    </td>
                                    <td className="py-4 px-6">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${appt.status === 'completed' ? 'bg-green-100 text-green-800' :
                                            appt.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                                'bg-yellow-100 text-yellow-800'
                                            }`}>
                                            {appt.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                            {appointments.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="py-8 text-center text-gray-500">No appointment history found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Interactions Tab */}
            {activeTab === 'interactions' && (
                <InteractionHistory clientId={id!} />
            )}
        </div>
    );
}

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc, collection, query, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAppStore } from '../store/useAppStore';
import { ArrowLeft, Phone, Mail, Save, Loader2, Instagram, Cake, Calendar, Clock, DollarSign } from 'lucide-react';
import { format } from 'date-fns';

export default function ClientProfile() {
    const { id } = useParams();
    const { user } = useAppStore();
    const navigate = useNavigate();
    const [client, setClient] = useState<any>(null);
    const [appointments, setAppointments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'overview' | 'history'>('overview');

    // Editable Fields
    const [notes, setNotes] = useState('');
    const [preferences, setPreferences] = useState('');
    const [instagram, setInstagram] = useState('');
    const [birthday, setBirthday] = useState('');

    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            if (!user.id || !id) return;
            try {
                // Fetch Client
                const docRef = doc(db, 'users', user.id, 'clients', id);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const data = docSnap.data();
                    setClient({ id: docSnap.id, ...data });
                    setNotes(data.notes || '');
                    setPreferences(data.preferences || '');
                    setInstagram(data.instagram || '');
                    setBirthday(data.birthday || '');

                    // Fetch Appointments
                    // In a real app, we'd filter by clientId. For now, we'll fetch all and filter client-side if needed, 
                    // but ideally we should have a compound index or subcollection structure.
                    // Let's assume we query by clientId if we had the index, or just fetch all for this user and filter.
                    // For simplicity/speed without index creation, let's fetch recent ones.
                    // BETTER: Store appointments in a subcollection of the client? Or root collection?
                    // The plan said `users/{userId}/appointments`. We need an index to query by clientId.
                    // Let's just fetch all for now (assuming small data) or use a client-subcollection approach if we want to be safe.
                    // Actually, let's just show a placeholder if we can't easily query without index.
                    // Wait, I can query by clientId if I don't sort.
                    const q = query(collection(db, 'users', user.id, 'appointments'), orderBy('date', 'desc'));
                    // This might fail without index if we filter by clientId too.
                    // Let's try to just get them all and filter in JS for this prototype to avoid index creation delays.
                    const apptsSnap = await getDocs(q);
                    const clientAppts = apptsSnap.docs
                        .map(doc => ({ id: doc.id, ...doc.data() }))
                        .filter((a: any) => a.clientId === id);

                    setAppointments(clientAppts);
                } else {
                    alert("Client not found");
                    navigate('/clients');
                }
            } catch (error) {
                console.error("Error fetching client data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user.id, id, navigate]);

    const handleSave = async () => {
        if (!user.id || !id) return;
        setSaving(true);
        try {
            const docRef = doc(db, 'users', user.id, 'clients', id);
            await updateDoc(docRef, {
                notes,
                preferences,
                instagram,
                birthday
            });
            // Optional: Show toast
        } catch (error) {
            console.error("Error saving profile:", error);
            alert("Failed to save profile.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="flex justify-center py-12"><Loader2 className="animate-spin" /></div>;
    if (!client) return null;

    return (
        <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
            <button
                onClick={() => navigate('/clients')}
                className="flex items-center text-gray-500 hover:text-charcoal transition-colors font-bold"
            >
                <ArrowLeft size={20} className="mr-2" />
                Back to Clients
            </button>

            {/* Header */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 flex flex-col md:flex-row items-start md:items-center gap-6">
                <div className="w-24 h-24 bg-pink-100 rounded-full flex items-center justify-center text-pink-600 font-bold text-3xl">
                    {client.name.charAt(0)}
                </div>
                <div className="flex-1 space-y-2">
                    <h1 className="text-3xl font-bold text-charcoal font-display">{client.name}</h1>
                    <div className="flex flex-wrap gap-4 text-gray-600 text-sm">
                        {client.phone && (
                            <div className="flex items-center bg-gray-50 px-3 py-1 rounded-full">
                                <Phone size={14} className="mr-2" />
                                {client.phone}
                            </div>
                        )}
                        {client.email && (
                            <div className="flex items-center bg-gray-50 px-3 py-1 rounded-full">
                                <Mail size={14} className="mr-2" />
                                {client.email}
                            </div>
                        )}
                        <div className="flex items-center bg-gray-50 px-3 py-1 rounded-full">
                            <Calendar size={14} className="mr-2" />
                            Since {client.createdAt?.toDate ? format(client.createdAt.toDate(), 'MMM yyyy') : 'Unknown'}
                        </div>
                    </div>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-charcoal text-white px-6 py-3 rounded-xl font-bold flex items-center hover:bg-black transition-colors disabled:opacity-70"
                >
                    {saving ? <Loader2 className="animate-spin mr-2" /> : <Save size={18} className="mr-2" />}
                    {saving ? 'Saving...' : 'Save Changes'}
                </button>
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
            </div>

            {/* Overview Tab */}
            {activeTab === 'overview' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Details Card */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-4">
                        <h3 className="font-bold text-charcoal text-lg">Details</h3>
                        <div className="space-y-3">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Instagram</label>
                                <div className="relative">
                                    <Instagram size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="text"
                                        value={instagram}
                                        onChange={(e) => setInstagram(e.target.value)}
                                        className="w-full pl-10 pr-3 py-2 rounded-lg border border-gray-200 focus:border-pink-500 focus:ring-0 text-sm"
                                        placeholder="@username"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Birthday</label>
                                <div className="relative">
                                    <Cake size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="text"
                                        value={birthday}
                                        onChange={(e) => setBirthday(e.target.value)}
                                        className="w-full pl-10 pr-3 py-2 rounded-lg border border-gray-200 focus:border-pink-500 focus:ring-0 text-sm"
                                        placeholder="MM/DD"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Preferences Card */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-4">
                        <h3 className="font-bold text-charcoal text-lg">Preferences</h3>
                        <textarea
                            value={preferences}
                            onChange={(e) => setPreferences(e.target.value)}
                            className="w-full h-32 p-3 rounded-lg border border-gray-200 focus:border-pink-500 focus:ring-0 resize-none text-sm"
                            placeholder="e.g. Loves almond shape, hates drilling, sensitive cuticles..."
                        />
                    </div>

                    {/* Private Notes Card */}
                    <div className="md:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-4">
                        <h3 className="font-bold text-charcoal text-lg">Private Notes</h3>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className="w-full h-32 p-3 rounded-lg border border-gray-200 focus:border-pink-500 focus:ring-0 resize-none text-sm"
                            placeholder="Internal notes about this client..."
                        />
                    </div>
                </div>
            )}

            {/* History Tab */}
            {activeTab === 'history' && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-gray-100">
                        <h3 className="font-bold text-charcoal text-lg">Appointment History</h3>
                    </div>
                    <div className="divide-y divide-gray-50">
                        {appointments.length === 0 ? (
                            <div className="p-8 text-center text-gray-500">
                                No past appointments found.
                            </div>
                        ) : (
                            appointments.map((appt) => (
                                <div key={appt.id} className="p-4 hover:bg-gray-50 transition-colors flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-500">
                                            <Calendar size={18} />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-charcoal">
                                                {appt.serviceDetails?.base?.system || 'Service'}
                                            </h4>
                                            <p className="text-sm text-gray-500 flex items-center">
                                                <Clock size={12} className="mr-1" />
                                                {appt.date?.toDate ? format(appt.date.toDate(), 'MMM d, yyyy') : 'Unknown Date'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-charcoal flex items-center justify-end">
                                            <DollarSign size={14} />
                                            {appt.totalPrice}
                                        </p>
                                        <span className={`text-xs px-2 py-0.5 rounded-full ${appt.status === 'completed' ? 'bg-green-100 text-green-700' :
                                            appt.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                                                'bg-yellow-100 text-yellow-700'
                                            }`}>
                                            {appt.status}
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

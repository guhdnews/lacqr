'use client';

import { useState, useEffect } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { collection, query, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Users, Calendar, TrendingUp, UserPlus, ArrowRight, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import ClientModal from '@/components/ClientModal';

export default function CRMDashboard() {
    const { user } = useAppStore();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalClients: 0,
        newClientsMonth: 0,
        upcomingAppointments: 0,
        estRevenue: 0
    });
    const [recentClients, setRecentClients] = useState<any[]>([]);
    const [isClientModalOpen, setIsClientModalOpen] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            if (!user?.id) return;

            try {
                // 1. Fetch Clients
                const clientsRef = collection(db, 'users', user.id, 'clients');
                const clientsSnapshot = await getDocs(clientsRef);
                const totalClients = clientsSnapshot.size;

                // Calculate new clients this month
                const now = new Date();
                const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
                const newClients = clientsSnapshot.docs.filter(doc => {
                    const data = doc.data();
                    return data.createdAt?.toDate() >= firstDayOfMonth;
                }).length;

                // Get recent clients
                const recentQuery = query(clientsRef, orderBy('createdAt', 'desc'), limit(5));
                const recentSnapshot = await getDocs(recentQuery);
                const recent = recentSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setRecentClients(recent);

                // 2. Fetch Appointments (Mock for now, or fetch if collection exists)
                // In a real scenario, we'd query the 'appointments' subcollection
                // const appointmentsRef = collection(db, 'users', user.id, 'appointments');
                // ... logic to count upcoming and revenue

                setStats({
                    totalClients,
                    newClientsMonth: newClients,
                    upcomingAppointments: 0, // Placeholder
                    estRevenue: 0 // Placeholder
                });

            } catch (error) {
                console.error("Error fetching CRM data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user?.id]);

    const handleClientCreated = (clientId: string) => {
        setIsClientModalOpen(false);
        router.push(`/dashboard/crm/${clientId}`);
    };

    if (loading) return <div className="flex justify-center py-12"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-12 p-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold font-serif text-charcoal">Client Relationship Manager</h1>
                    <p className="text-gray-500">Manage your clients, track history, and grow your business.</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => setIsClientModalOpen(true)}
                        className="bg-charcoal text-white px-4 py-2 rounded-xl font-bold flex items-center hover:bg-black transition-colors"
                    >
                        <UserPlus size={18} className="mr-2" />
                        Add Client
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-gray-500 font-medium text-sm">Total Clients</h3>
                        <Users size={20} className="text-pink-500" />
                    </div>
                    <p className="text-3xl font-bold text-charcoal">{stats.totalClients}</p>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-gray-500 font-medium text-sm">New This Month</h3>
                        <TrendingUp size={20} className="text-green-500" />
                    </div>
                    <p className="text-3xl font-bold text-charcoal">{stats.newClientsMonth}</p>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-gray-500 font-medium text-sm">Upcoming Appts</h3>
                        <Calendar size={20} className="text-blue-500" />
                    </div>
                    <p className="text-3xl font-bold text-charcoal">{stats.upcomingAppointments}</p>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-gray-500 font-medium text-sm">Est. Revenue</h3>
                        <span className="text-gray-400 text-xs">This Month</span>
                    </div>
                    <p className="text-3xl font-bold text-charcoal">${stats.estRevenue}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Clients */}
                <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                        <h3 className="font-bold text-lg text-charcoal">Recent Clients</h3>
                        <Link href="/dashboard/crm" className="text-pink-500 text-sm font-bold hover:underline flex items-center">
                            View All <ArrowRight size={16} className="ml-1" />
                        </Link>
                    </div>
                    <div className="divide-y divide-gray-50">
                        {recentClients.length === 0 ? (
                            <div className="p-8 text-center text-gray-500">
                                No clients yet. Add your first one!
                            </div>
                        ) : (
                            recentClients.map((client) => (
                                <Link
                                    key={client.id}
                                    href={`/dashboard/crm/${client.id}`}
                                    className="flex items-center p-4 hover:bg-gray-50 transition-colors group"
                                >
                                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 font-bold mr-4 group-hover:bg-pink-100 group-hover:text-pink-500 transition-colors">
                                        {client.name.charAt(0)}
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-bold text-charcoal">{client.name}</h4>
                                        <p className="text-sm text-gray-500">{client.phone || 'No phone'}</p>
                                    </div>
                                    <ArrowRight size={18} className="text-gray-300 group-hover:text-pink-500" />
                                </Link>
                            ))
                        )}
                    </div>
                </div>

                {/* Quick Actions / Tips */}
                <div className="space-y-6">
                    <div className="bg-gradient-to-br from-charcoal to-black text-white rounded-3xl p-6 shadow-lg">
                        <h3 className="font-bold text-lg mb-2">Pro Tip</h3>
                        <p className="text-gray-300 text-sm mb-4">
                            Adding detailed notes about your client&apos;s preferences (e.g., &quot;Loves almond shape&quot;) helps you deliver a personalized experience every time.
                        </p>
                    </div>
                </div>
            </div>

            <ClientModal
                isOpen={isClientModalOpen}
                onClose={() => setIsClientModalOpen(false)}
                mode="create"
                onClientSelected={(client) => handleClientCreated(client.id)}
            />
        </div>
    );
}

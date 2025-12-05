'use client';

import { useState, useEffect } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { Camera, Sparkles, Users, ArrowRight, TrendingUp, Calendar, DollarSign } from 'lucide-react';
import Link from 'next/link';
import DraftsList from '@/components/DraftsList';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function Dashboard() {
    const { user } = useAppStore();
    const [stats, setStats] = useState({
        pendingBookings: 0,
        acceptedBookings: 0,
        totalClients: 0
    });

    useEffect(() => {
        if (user?.id) {
            const fetchStats = async () => {
                try {
                    // Fetch Bookings
                    const bookingsQuery = query(collection(db, 'quotes'), where('salonId', '==', user.id));
                    const bookingsSnap = await getDocs(bookingsQuery);
                    const bookings = bookingsSnap.docs.map(doc => doc.data());

                    const pending = bookings.filter(b => b.status === 'pending').length;
                    const accepted = bookings.filter(b => b.status === 'accepted').length;

                    // Fetch Clients (Unique phone numbers from bookings + manually added clients if we had a separate collection, 
                    // but for now we'll just count unique clients from bookings as a proxy or if there's a clients collection)
                    // Assuming 'clients' collection exists based on CRM features, otherwise use unique phones from quotes
                    const clientsQuery = query(collection(db, 'clients'), where('techId', '==', user.id));
                    const clientsSnap = await getDocs(clientsQuery);
                    const totalClients = clientsSnap.size;

                    setStats({
                        pendingBookings: pending,
                        acceptedBookings: accepted,
                        totalClients: totalClients
                    });
                } catch (error) {
                    console.error("Error fetching dashboard stats:", error);
                }
            };
            fetchStats();
        }
    }, [user?.id]);

    const quickActions = [
        {
            title: "New Scan",
            desc: "Price a set with AI",
            icon: <Camera size={24} className="text-white" />,
            bg: "bg-pink-500",
            link: "/dashboard/lacqr-lens"
        },
        {
            title: "Smart Quote",
            desc: "Generate booking text",
            icon: <Sparkles size={24} className="text-white" />,
            bg: "bg-indigo-500",
            link: "/dashboard/smart-quote"
        },
        {
            title: "CRM",
            desc: "Manage your book",
            icon: <Users size={24} className="text-white" />,
            bg: "bg-purple-500",
            link: "/dashboard/crm"
        }
    ];

    return (
        <div className="p-8 space-y-8 max-w-5xl mx-auto">
            {/* Welcome Section */}
            <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
                <div className="relative z-10">
                    <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.name?.split(' ')[0] || 'Tech'}! 👋</h1>
                    <p className="text-gray-300 mb-6 max-w-lg">Ready to price some sets? Your AI assistant is standing by.</p>
                    <Link
                        href="/dashboard/lacqr-lens"
                        className="inline-flex items-center gap-2 bg-white text-gray-900 px-6 py-3 rounded-xl font-bold hover:bg-gray-100 transition-colors"
                    >
                        <Camera size={20} />
                        Start New Scan
                    </Link>
                </div>

                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-pink-500/20 rounded-full blur-3xl -mr-16 -mt-16"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl -ml-10 -mb-10"></div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {quickActions.map((action, idx) => (
                    <Link
                        key={idx}
                        href={action.link}
                        className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all group"
                    >
                        <div className={`${action.bg} w-12 h-12 rounded-xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                            {action.icon}
                        </div>
                        <h3 className="font-bold text-gray-900 text-lg">{action.title}</h3>
                        <p className="text-sm text-gray-500">{action.desc}</p>
                    </Link>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Drafts */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="font-bold text-xl text-gray-900">Recent Drafts</h2>
                        <Link href="/dashboard/drafts" className="text-sm text-pink-500 font-medium hover:text-pink-600">
                            View All
                        </Link>
                    </div>
                    <DraftsList />
                </div>

                {/* Business Stats */}
                <div className="space-y-4">
                    <h2 className="font-bold text-xl text-gray-900">Business Overview</h2>
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6">

                        {/* Pending Requests */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="bg-yellow-100 p-2 rounded-lg text-yellow-600">
                                    <Calendar size={20} />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 font-medium">Pending Requests</p>
                                    <p className="text-xl font-black text-gray-900">{stats.pendingBookings}</p>
                                </div>
                            </div>
                            {stats.pendingBookings > 0 && (
                                <Link href="/dashboard/bookings" className="text-xs font-bold text-pink-500 hover:underline">
                                    Review
                                </Link>
                            )}
                        </div>

                        <div className="h-px bg-gray-100"></div>

                        {/* Accepted Bookings */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="bg-green-100 p-2 rounded-lg text-green-600">
                                    <TrendingUp size={20} />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 font-medium">Upcoming Appts</p>
                                    <p className="text-xl font-black text-gray-900">{stats.acceptedBookings}</p>
                                </div>
                            </div>
                        </div>

                        <div className="h-px bg-gray-100"></div>

                        {/* Total Clients */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
                                    <Users size={20} />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 font-medium">Total Clients</p>
                                    <p className="text-xl font-black text-gray-900">{stats.totalClients}</p>
                                </div>
                            </div>
                            <Link href="/dashboard/crm" className="text-xs font-bold text-gray-400 hover:text-gray-600">
                                View CRM
                            </Link>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}

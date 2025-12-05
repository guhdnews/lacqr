'use client';

import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAppStore } from '@/store/useAppStore';
import BookingCard from '@/components/BookingCard';
import CalendarView from '@/components/CalendarView';
import { Loader2, Inbox, CheckCircle, XCircle, Calendar, List } from 'lucide-react';

export default function BookingsPage() {
    const { user } = useAppStore();
    const [bookings, setBookings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'pending' | 'accepted' | 'declined' | 'completed'>('all');
    const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');

    useEffect(() => {
        const fetchBookings = async () => {
            if (!user?.id) return;

            try {
                // Query quotes where salonId matches current user
                // Note: We need a composite index for salonId + createdAt in Firestore
                // For MVP, we might just fetch all and sort client-side if index is missing
                const q = query(
                    collection(db, 'quotes'),
                    where('salonId', '==', user.id)
                    // orderBy('createdAt', 'desc') // Requires index
                );

                const snapshot = await getDocs(q);
                const fetchedBookings = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));

                // Client-side sort to avoid index creation delay for MVP
                fetchedBookings.sort((a: any, b: any) => {
                    const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
                    const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt);
                    return dateB.getTime() - dateA.getTime();
                });

                setBookings(fetchedBookings);
            } catch (error) {
                console.error("Error fetching bookings:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchBookings();
    }, [user?.id]);

    const handleStatusChange = (id: string, newStatus: string) => {
        if (newStatus === 'deleted') {
            setBookings(prev => prev.filter(b => b.id !== id));
        } else {
            setBookings(prev => prev.map(b =>
                b.id === id ? { ...b, status: newStatus } : b
            ));
        }
    };

    const filteredBookings = bookings.filter(b => {
        if (filter === 'all') return true;
        return (b.status || 'pending') === filter;
    });

    if (loading) return (
        <div className="flex justify-center items-center min-h-[60vh]">
            <Loader2 className="animate-spin text-pink-500" size={48} />
        </div>
    );

    return (
        <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-charcoal font-display">Booking Inbox</h1>
                    <p className="text-gray-600">Manage your incoming appointment requests.</p>
                </div>

                <div className="flex gap-4">
                    {/* View Toggle */}
                    <div className="flex bg-white p-1 rounded-xl border border-gray-100 shadow-sm">
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-charcoal text-white shadow-md' : 'text-gray-400 hover:text-charcoal'}`}
                            title="List View"
                        >
                            <List size={20} />
                        </button>
                        <button
                            onClick={() => setViewMode('calendar')}
                            className={`p-2 rounded-lg transition-all ${viewMode === 'calendar' ? 'bg-charcoal text-white shadow-md' : 'text-gray-400 hover:text-charcoal'}`}
                            title="Calendar View"
                        >
                            <Calendar size={20} />
                        </button>
                    </div>

                    {/* Filter Tabs (Only for List View) */}
                    {viewMode === 'list' && (
                        <div className="flex bg-white p-1 rounded-xl border border-gray-100 shadow-sm">
                            {(['all', 'pending', 'accepted', 'completed', 'declined'] as const).map((f) => (
                                <button
                                    key={f}
                                    onClick={() => setFilter(f)}
                                    className={`px-4 py-2 rounded-lg text-sm font-bold capitalize transition-all ${filter === f
                                        ? 'bg-charcoal text-white shadow-md'
                                        : 'text-gray-500 hover:text-charcoal hover:bg-gray-50'
                                        }`}
                                >
                                    {f}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-600">
                        <Inbox size={24} />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-charcoal">
                            {bookings.filter(b => (b.status || 'pending') === 'pending').length}
                        </p>
                        <p className="text-xs font-bold text-gray-400 uppercase">Pending</p>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                        <CheckCircle size={24} />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-charcoal">
                            {bookings.filter(b => b.status === 'accepted').length}
                        </p>
                        <p className="text-xs font-bold text-gray-400 uppercase">Accepted</p>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                        <CheckCircle size={24} />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-charcoal">
                            {bookings.filter(b => b.status === 'completed').length}
                        </p>
                        <p className="text-xs font-bold text-gray-400 uppercase">Completed</p>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center text-red-600">
                        <XCircle size={24} />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-charcoal">
                            {bookings.filter(b => b.status === 'declined').length}
                        </p>
                        <p className="text-xs font-bold text-gray-400 uppercase">Declined</p>
                    </div>
                </div>
            </div>

            {/* Content Area */}
            {viewMode === 'list' ? (
                <div className="space-y-4">
                    {filteredBookings.length === 0 ? (
                        <div className="text-center py-16 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                            <Inbox size={48} className="mx-auto text-gray-300 mb-4" />
                            <h3 className="text-lg font-bold text-gray-500">No bookings found</h3>
                            <p className="text-gray-400">
                                {filter === 'all'
                                    ? "Share your booking link to get started!"
                                    : `No ${filter} bookings.`}
                            </p>
                        </div>
                    ) : (
                        filteredBookings.map((booking) => (
                            <BookingCard
                                key={booking.id}
                                booking={{ ...booking, status: booking.status || 'pending' }}
                                onStatusChange={handleStatusChange}
                            />
                        ))
                    )}
                </div>
            ) : (
                <CalendarView
                    bookings={bookings}
                    onBookingClick={(booking) => {
                        // For now, just alert or log. Ideally open a modal.
                        // Since we don't have a dedicated modal yet, maybe switch to list view and filter?
                        // Or just show a simple alert for MVP.
                        alert(`Booking Details:\nClient: ${booking.clientName}\nService: ${booking.data.base.system} ${booking.data.base.length}\nStatus: ${booking.status}`);
                    }}
                />
            )}
        </div>
    );
}

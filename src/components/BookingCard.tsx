import { useState } from 'react';
import { format } from 'date-fns';
import { Check, X, Calendar, Clock, DollarSign, ChevronDown, ChevronUp, User, Phone, MessageSquare, Trash2 } from 'lucide-react';
import { doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { ServiceSelection } from '../types/serviceSchema';

interface BookingRequest {
    id: string;
    clientId?: string;
    clientName: string;
    clientPhone: string;
    clientInstagram?: string;
    clientNotes?: string;
    services: ServiceSelection;
    status: 'pending' | 'accepted' | 'declined' | 'completed';
    createdAt: any;
    totalPrice: number;
    salonId: string;
}

interface BookingCardProps {
    booking: BookingRequest;
    onStatusChange: (id: string, newStatus: 'accepted' | 'declined' | 'deleted' | 'completed') => void;
}

export default function BookingCard({ booking, onStatusChange }: BookingCardProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleAction = async (status: 'accepted' | 'declined' | 'completed') => {
        setLoading(true);
        try {
            // 1. Update the quote status
            const quoteRef = doc(db, 'quotes', booking.id);
            await updateDoc(quoteRef, { status });

            // 2. Simulate SMS Notification to Client
            // In a real app, this would trigger a Cloud Function (Twilio/SendGrid)
            console.log(`📲 SMS Sent to ${booking.clientPhone}: "Your appointment request has been ${status}!"`);
            alert(`Booking ${status}! Client has been notified via SMS.`);

            onStatusChange(booking.id, status);
        } catch (error) {
            console.error("Error updating booking:", error);
            alert("Failed to update booking status.");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm("Are you sure you want to delete this booking? This cannot be undone.")) return;

        setLoading(true);
        try {
            await deleteDoc(doc(db, 'quotes', booking.id));
            onStatusChange(booking.id, 'deleted');
        } catch (error) {
            console.error("Error deleting booking:", error);
            alert("Failed to delete booking.");
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (timestamp: any) => {
        if (!timestamp) return 'Unknown Date';
        // Handle Firestore Timestamp or JS Date
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return format(date, 'MMM d, yyyy @ h:mm a');
    };

    return (
        <div className={`bg-white rounded-2xl border transition-all duration-200 overflow-hidden ${booking.status === 'pending' ? 'border-pink-200 shadow-md' : 'border-gray-100 opacity-75'
            }`}>
            {/* Header / Summary */}
            <div className="p-5 flex flex-col md:flex-row gap-4 justify-between items-start md:items-center cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => setIsExpanded(!isExpanded)}>

                <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${booking.status === 'pending' ? 'bg-pink-100 text-pink-600' :
                        booking.status === 'accepted' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'
                        }`}>
                        {booking.clientName.charAt(0)}
                    </div>
                    <div>
                        <h3 className="font-bold text-charcoal text-lg">{booking.clientName}</h3>
                        <div className="flex items-center text-sm text-gray-500 gap-3">
                            <span className="flex items-center"><Clock size={14} className="mr-1" /> {formatDate(booking.createdAt)}</span>
                            <span className="flex items-center font-medium text-charcoal"><DollarSign size={14} className="mr-1" /> ${booking.totalPrice}</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
                    <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${booking.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                        booking.status === 'accepted' ? 'bg-green-100 text-green-700' :
                            'bg-red-100 text-red-700'
                        }`}>
                        {booking.status}
                    </div>
                    {isExpanded ? <ChevronUp size={20} className="text-gray-400" /> : <ChevronDown size={20} className="text-gray-400" />}
                </div>
            </div>

            {/* Expanded Details */}
            {isExpanded && (
                <div className="px-5 pb-5 pt-0 border-t border-gray-100 bg-gray-50/50">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
                        {/* Client Details */}
                        <div className="space-y-3">
                            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Client Details</h4>
                            <div className="space-y-2 text-sm">
                                <div className="flex items-center text-gray-700">
                                    <Phone size={16} className="mr-2 text-gray-400" />
                                    <a href={`tel:${booking.clientPhone}`} className="hover:text-pink-500 underline">{booking.clientPhone}</a>
                                </div>
                                {booking.clientInstagram && (
                                    <div className="flex items-center text-gray-700">
                                        <span className="w-4 h-4 mr-2 flex items-center justify-center font-bold text-xs text-gray-400">@</span>
                                        <a href={`https://instagram.com/${booking.clientInstagram.replace('@', '')}`} target="_blank" rel="noreferrer" className="hover:text-pink-500 underline">
                                            {booking.clientInstagram}
                                        </a>
                                    </div>
                                )}
                                {booking.clientNotes && (
                                    <div className="flex items-start text-gray-700 bg-white p-3 rounded-lg border border-gray-200 mt-2">
                                        <MessageSquare size={16} className="mr-2 text-gray-400 mt-0.5 flex-shrink-0" />
                                        <p className="italic text-gray-600">"{booking.clientNotes}"</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Service Breakdown */}
                        <div className="space-y-3">
                            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Service Request</h4>
                            <div className="bg-white p-4 rounded-xl border border-gray-200 space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Base System</span>
                                    <span className="font-medium">{booking.services.base.system}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Length/Shape</span>
                                    <span className="font-medium">{booking.services.base.length} / {booking.services.base.shape}</span>
                                </div>
                                {booking.services.art.level && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Art Level</span>
                                        <span className="font-medium">{booking.services.art.level}</span>
                                    </div>
                                )}
                                <div className="pt-2 border-t border-gray-100 flex justify-between font-bold text-charcoal">
                                    <span>Est. Total</span>
                                    <span>${booking.totalPrice}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-between items-center pt-2">
                        {/* Delete Button (Always visible when expanded) */}
                        <button
                            onClick={(e) => { e.stopPropagation(); handleDelete(); }}
                            disabled={loading}
                            className="p-2 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                            title="Delete Booking"
                        >
                            <Trash2 size={18} />
                        </button>

                        {/* Status Actions (Only for pending) */}
                        {booking.status === 'pending' && (
                            <div className="flex gap-3">
                                <button
                                    onClick={(e) => { e.stopPropagation(); handleAction('declined'); }}
                                    disabled={loading}
                                    className="px-4 py-2 rounded-xl border border-gray-300 text-gray-600 font-bold hover:bg-gray-100 transition-colors flex items-center disabled:opacity-50"
                                >
                                    <X size={18} className="mr-2" />
                                    Decline
                                </button>
                                <button
                                    onClick={(e) => { e.stopPropagation(); handleAction('accepted'); }}
                                    disabled={loading}
                                    className="px-6 py-2 rounded-xl bg-charcoal text-white font-bold hover:bg-black transition-colors flex items-center disabled:opacity-50 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                                >
                                    <Check size={18} className="mr-2" />
                                    {loading ? 'Processing...' : 'Accept Request'}
                                </button>
                            </div>
                        )}

                        {/* Actions for Accepted Bookings */}
                        {booking.status === 'accepted' && (
                            <div className="flex gap-3">
                                <button
                                    onClick={(e) => { e.stopPropagation(); handleAction('completed'); }}
                                    disabled={loading}
                                    className="px-6 py-2 rounded-xl bg-green-600 text-white font-bold hover:bg-green-700 transition-colors flex items-center disabled:opacity-50 shadow-md hover:shadow-lg"
                                >
                                    <Check size={18} className="mr-2" />
                                    Mark Completed
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

/* eslint-disable @next/next/no-img-element */
'use client';

import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import SmartQuoteView from '@/components/SmartQuoteView';
import { MasterServiceMenu, ServiceSelection } from '@/types/serviceSchema';
import { DEFAULT_MENU } from '@/utils/pricingCalculator';
import { BookingConfig } from '@/types/user';
import { Phone, Mail, Instagram, ExternalLink } from 'lucide-react';
import PaymentModal from '@/components/PaymentModal';

interface PublicBookingPageProps {
    params: {
        username: string;
    };
}

export default function PublicBookingPage({ params }: PublicBookingPageProps) {
    const [salonUser, setSalonUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [pendingBooking, setPendingBooking] = useState<{ quote: ServiceSelection, clientDetails: any } | null>(null);

    useEffect(() => {
        const fetchSalonUser = async () => {
            try {
                console.log("🔍 Fetching salon for handle:", params.username);
                // Query users by bookingHandle (username)
                const usersRef = collection(db, 'users');
                const q = query(usersRef, where('bookingHandle', '==', params.username.toLowerCase()));
                const querySnapshot = await getDocs(q);

                console.log("📸 Query snapshot size:", querySnapshot.size);

                if (querySnapshot.empty) {
                    console.warn("⚠️ No salon found for handle:", params.username);
                    setError("Salon not found.");
                } else {
                    const userData = querySnapshot.docs[0].data();
                    console.log("✅ Salon found:", userData.salonName);
                    setSalonUser({ id: querySnapshot.docs[0].id, ...userData });
                }
            } catch (err) {
                console.error("❌ Error fetching salon:", err);
                setError("Failed to load booking page.");
            } finally {
                setLoading(false);
            }
        };

        if (params.username) {
            fetchSalonUser();
        }
    }, [params.username]);

    // SEO: Update Page Title
    useEffect(() => {
        if (salonUser?.salonName || salonUser?.name) {
            document.title = `Book with ${salonUser.salonName || salonUser.name} | Lacqr`;
        }
    }, [salonUser]);

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
                <div className="relative">
                    <div className="w-16 h-16 border-4 border-gray-200 border-t-pink-500 rounded-full animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
                    </div>
                </div>
                <p className="mt-4 text-gray-400 font-medium animate-pulse">Loading Salon...</p>
            </div>
        );
    }

    if (error || !salonUser) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
                <div className="text-center max-w-md bg-white p-8 rounded-3xl shadow-xl border border-gray-100">
                    <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <ExternalLink size={32} className="rotate-180" />
                    </div>
                    <h1 className="text-2xl font-black text-gray-900 mb-2">Page Not Found</h1>
                    <p className="text-gray-500 mb-6">{error || "We couldn't find a booking page for this handle. It might have been changed or deleted."}</p>
                    <a href="/" className="inline-flex items-center justify-center px-6 py-3 bg-gray-900 text-white font-bold rounded-xl hover:bg-black transition-colors w-full">
                        Go to Lacqr Home
                    </a>
                </div>
            </div>
        );
    }

    const config: BookingConfig = salonUser.bookingConfig || {
        themeColor: salonUser.brandColor || '#ec4899',
        welcomeMessage: `Welcome to ${salonUser.salonName || salonUser.name}'s booking page!`,
        policies: [],
        showSocialLinks: false,
        font: 'sans',
        buttonStyle: 'rounded'
    };

    const handleBook = async (quote: ServiceSelection, clientDetails: { name: string; phone: string; instagram?: string; notes?: string }) => {
        // Store booking details and show payment modal
        setPendingBooking({ quote, clientDetails });
        setShowPaymentModal(true);
    };

    const handlePaymentSuccess = async (paymentIntentId: string) => {
        if (!salonUser?.id || !pendingBooking) return;

        const { quote, clientDetails } = pendingBooking;

        try {
            // 1. Create Booking
            await addDoc(collection(db, 'quotes'), {
                salonId: salonUser.id,
                clientName: clientDetails.name,
                clientPhone: clientDetails.phone,
                clientInstagram: clientDetails.instagram || '',
                clientNotes: clientDetails.notes || '',
                data: quote,
                totalPrice: quote.estimatedPrice || 0,
                status: 'pending', // Or 'paid_deposit'
                paymentStatus: 'paid',
                paymentIntentId: paymentIntentId,
                createdAt: serverTimestamp(),
                isRead: false
            });

            // 2. Create Notification
            await addDoc(collection(db, `users/${salonUser.id}/notifications`), {
                type: 'booking_request',
                title: 'New Paid Appointment',
                message: `${clientDetails.name} booked a ${quote.base.system} set. Deposit paid.`,
                read: false,
                createdAt: serverTimestamp(),
                link: '/dashboard/bookings'
            });

            console.log("✅ Booking saved after payment!");
            setShowPaymentModal(false);
            setPendingBooking(null);
            alert("Booking confirmed! You will receive a confirmation shortly.");
            // Optional: Redirect to success page
        } catch (err) {
            console.error("❌ Error saving booking:", err);
            alert("Payment successful, but booking failed to save. Please contact the salon.");
        }
    };

    const brandColor = salonUser.brandColor || config.themeColor || '#ec4899';

    // Font mapping
    const fontClass = {
        'sans': 'font-sans',
        'serif': 'font-serif',
        'mono': 'font-mono'
    }[config.font as string] || 'font-sans';

    // Button radius mapping
    const buttonRadiusClass = {
        'rounded': 'rounded-xl',
        'pill': 'rounded-full',
        'square': 'rounded-none'
    }[config.buttonStyle as string] || 'rounded-xl';

    return (
        <div className={`min-h-screen bg-gray-50 ${fontClass}`}>
            {/* Dynamic Header */}
            <div className="relative">
                {/* Header Image or Color Background */}
                <div
                    className="h-48 w-full bg-cover bg-center"
                    style={{
                        backgroundColor: brandColor,
                        backgroundImage: salonUser.headerImageUrl ? `url(${salonUser.headerImageUrl})` : 'none'
                    }}
                >
                    {!salonUser.headerImageUrl && (
                        <div className="h-full w-full flex items-center justify-center bg-black/10">
                            {/* Optional pattern or gradient overlay if no image */}
                        </div>
                    )}
                </div>

                {/* Profile Section */}
                <div className="max-w-md mx-auto px-4 relative -mt-16 text-center z-10 mb-8">
                    <div className="w-32 h-32 bg-white rounded-full mx-auto mb-4 p-1 shadow-xl">
                        {salonUser.logoUrl ? (
                            <img
                                src={salonUser.logoUrl}
                                alt={salonUser.salonName || "Salon Logo"}
                                className="w-full h-full rounded-full object-cover bg-gray-200"
                            />
                        ) : (
                            <div className="w-full h-full rounded-full bg-gray-200 flex items-center justify-center text-gray-400 text-4xl font-bold">
                                {(salonUser.salonName?.[0] || salonUser.name?.[0] || 'S').toUpperCase()}
                            </div>
                        )}
                    </div>

                    <h1 className="text-2xl font-black text-gray-900 mb-1">{salonUser.salonName || salonUser.name}</h1>
                    <p className="text-gray-500 font-medium mb-4">@{salonUser.bookingHandle}</p>

                    {/* Welcome Card */}
                    <div
                        className={`bg-white p-6 shadow-lg text-white relative overflow-hidden ${buttonRadiusClass}`}
                        style={{ backgroundColor: brandColor }}
                    >
                        <h3 className="font-bold mb-2 relative z-10">Welcome</h3>
                        <p className="text-sm opacity-90 relative z-10">{config.welcomeMessage}</p>
                        {/* Decorative circle */}
                        <div className="absolute -top-12 -right-12 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
                    </div>

                    {/* Contact & Social Links */}
                    {config.showSocialLinks && (
                        <div className="flex justify-center gap-4 mt-6 flex-wrap">
                            {(config.publicPhone || salonUser.phone) && (
                                <a href={`tel:${config.publicPhone || salonUser.phone}`} className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm text-sm font-bold text-gray-700 hover:text-pink-500 transition-colors">
                                    <Phone size={16} />
                                    <span>Call</span>
                                </a>
                            )}
                            {(config.publicEmail || salonUser.email) && (
                                <a href={`mailto:${config.publicEmail || salonUser.email}`} className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm text-sm font-bold text-gray-700 hover:text-pink-500 transition-colors">
                                    <Mail size={16} />
                                    <span>Email</span>
                                </a>
                            )}
                            {config.instagramHandle && (
                                <a href={`https://instagram.com/${config.instagramHandle.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm text-sm font-bold text-gray-700 hover:text-pink-500 transition-colors">
                                    <Instagram size={16} />
                                    <span>Instagram</span>
                                </a>
                            )}
                            {config.tiktokHandle && (
                                <a href={`https://tiktok.com/@${config.tiktokHandle.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm text-sm font-bold text-gray-700 hover:text-pink-500 transition-colors">
                                    <ExternalLink size={16} />
                                    <span>TikTok</span>
                                </a>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <div className="max-w-md mx-auto px-4 pb-12">
                {/* Policies Card */}
                {config.policies && config.policies.length > 0 && (
                    <div className={`bg-white shadow-sm border border-gray-100 p-6 mb-6 ${buttonRadiusClass}`}>
                        <h3 className="font-bold text-gray-900 mb-3">Please Read Before Booking</h3>
                        <ul className="space-y-2">
                            {config.policies.map((policy: string, i: number) => (
                                <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-gray-400 flex-shrink-0" />
                                    {policy}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Smart Quote Engine */}
                <div className={`bg-white shadow-xl border border-gray-100 overflow-hidden ${buttonRadiusClass}`}>
                    <div className="p-6">
                        <h2 className="text-xl font-bold text-center mb-6">Get a Quote & Book</h2>
                        <SmartQuoteView
                            menu={salonUser.serviceMenu || DEFAULT_MENU}
                            isAuthenticated={false} // Public view
                            themeColor={brandColor}
                            buttonStyle={config.buttonStyle}
                            onBook={handleBook}
                        />
                    </div>
                </div>
            </div>

            {/* Payment Modal */}
            <PaymentModal
                isOpen={showPaymentModal}
                onClose={() => setShowPaymentModal(false)}
                amount={pendingBooking?.quote.estimatedPrice ? pendingBooking.quote.estimatedPrice * 0.20 : 20} // 20% deposit or $20 min
                salonId={salonUser.id}
                onSuccess={handlePaymentSuccess}
            />
        </div>
    );
}

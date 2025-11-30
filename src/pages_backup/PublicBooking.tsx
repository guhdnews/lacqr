import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, addDoc, doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Loader2, MapPin, Check, Clock, ChevronRight, ArrowLeft } from 'lucide-react';
import { format, addDays } from 'date-fns';

export default function PublicBooking() {
    const { handle } = useParams();
    // Booking Settings State
    const [settings, setSettings] = useState<any>({
        themeColor: '#ec4899',
        backgroundType: 'solid',
        backgroundValue: '#f9fafb', // gray-50
        layout: 'centered'
    });

    const [salon, setSalon] = useState<any>(null);
    const [menu, setMenu] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Booking Flow State
    const [step, setStep] = useState<'service' | 'datetime' | 'details' | 'confirmation'>('service');
    const [selectedSystem, setSelectedSystem] = useState<any>(null);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [selectedTime, setSelectedTime] = useState<string | null>(null);

    // Client Details
    const [clientName, setClientName] = useState('');
    const [clientPhone, setClientPhone] = useState('');
    const [clientEmail, setClientEmail] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const fetchSalonAndMenu = async () => {
            try {
                // 1. Find user by bookingHandle
                const q = query(collection(db, 'users'), where('bookingHandle', '==', handle));
                const querySnapshot = await getDocs(q);

                let salonData = null;
                let salonId = null;

                if (!querySnapshot.empty) {
                    const doc = querySnapshot.docs[0];
                    salonData = doc.data();
                    salonId = doc.id;
                } else {
                    // Fallback: Try to find by ID
                    const docRef = doc(db, 'users', handle!);
                    const docSnap = await getDoc(docRef);
                    if (docSnap.exists()) {
                        salonData = docSnap.data();
                        salonId = docSnap.id;
                    }
                }

                if (salonData && salonId) {
                    setSalon({ id: salonId, ...salonData });

                    // Apply Settings if they exist
                    if (salonData.bookingSettings) {
                        setSettings({
                            themeColor: salonData.bookingSettings.themeColor || '#ec4899',
                            backgroundType: salonData.bookingSettings.backgroundType || 'solid',
                            backgroundValue: salonData.bookingSettings.backgroundValue || '#f9fafb',
                            layout: salonData.bookingSettings.layout || 'centered'
                        });
                    }

                    // Fetch Menu
                    const menuRef = doc(db, 'users', salonId, 'serviceMenu', 'default');
                    const menuSnap = await getDoc(menuRef);
                    if (menuSnap.exists()) {
                        setMenu(menuSnap.data());
                    }
                } else {
                    setError('Salon not found.');
                }

            } catch (err) {
                console.error("Error fetching salon:", err);
                setError('Failed to load salon details.');
            } finally {
                setLoading(false);
            }
        };

        if (handle) fetchSalonAndMenu();
    }, [handle]);

    const handleSystemSelect = (sys: any) => {
        setSelectedSystem(sys);
        setStep('datetime');
        // Default to today
        setSelectedDate(new Date());
    };

    const handleDateSelect = (date: Date) => {
        setSelectedDate(date);
        setSelectedTime(null); // Reset time when date changes
    };

    const generateTimeSlots = () => {
        // Mock time slots
        return ['9:00 AM', '10:30 AM', '12:00 PM', '1:30 PM', '3:00 PM', '4:30 PM'];
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedSystem || !selectedDate || !selectedTime || !salon) return;

        setSubmitting(true);
        try {
            // Create Appointment
            await addDoc(collection(db, 'appointments'), {
                salonId: salon.id,
                clientName,
                clientPhone,
                clientEmail,
                serviceName: selectedSystem.system,
                price: selectedSystem.price,
                date: selectedDate.toISOString(),
                time: selectedTime,
                status: 'pending',
                createdAt: new Date().toISOString()
            });

            // If client doesn't exist, maybe create them? (Optional for now)

            setStep('confirmation');
        } catch (err) {
            console.error("Booking Error:", err);
            alert("Failed to book appointment. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    const getBackgroundStyle = () => {
        if (settings.backgroundType === 'image') {
            return { backgroundImage: `url(${settings.backgroundValue})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed' };
        } else if (settings.backgroundType === 'gradient') {
            return { background: settings.backgroundValue };
        }
        return { backgroundColor: settings.backgroundValue };
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>;
    if (error) return <div className="min-h-screen flex items-center justify-center text-red-500">{error}</div>;

    const Content = () => (
        <div className={`max-w-3xl mx-auto px-6 py-8 ${settings.layout === 'centered' ? '' : 'lg:max-w-none lg:px-12 lg:py-12'}`}>
            {step === 'confirmation' ? (
                <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 text-center space-y-6 animate-in fade-in zoom-in-95">
                    <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto text-white" style={{ backgroundColor: settings.themeColor }}>
                        <Check size={40} />
                    </div>
                    <div>
                        <h2 className="text-3xl font-bold text-charcoal mb-2">Booking Confirmed!</h2>
                        <p className="text-gray-500">Thanks {clientName}, we'll see you soon.</p>
                    </div>
                    <div className="bg-gray-50 p-6 rounded-xl text-left space-y-3">
                        <div className="flex justify-between">
                            <span className="text-gray-500">Service</span>
                            <span className="font-bold text-charcoal">{selectedSystem?.system}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Date</span>
                            <span className="font-bold text-charcoal">
                                {selectedDate ? format(selectedDate, 'MMM d, yyyy') : ''} at {selectedTime}
                            </span>
                        </div>
                    </div>
                    <button
                        onClick={() => window.location.reload()}
                        className="font-bold hover:underline"
                        style={{ color: settings.themeColor }}
                    >
                        Book Another Appointment
                    </button>
                </div>
            ) : (
                <div className="space-y-8">
                    {/* Progress */}
                    <div className="flex items-center space-x-2 text-sm font-medium text-gray-400">
                        <span style={{ color: step === 'service' ? settings.themeColor : undefined }}>Service</span>
                        <ChevronRight size={14} />
                        <span style={{ color: step === 'datetime' ? settings.themeColor : undefined }}>Date & Time</span>
                        <ChevronRight size={14} />
                        <span style={{ color: step === 'details' ? settings.themeColor : undefined }}>Details</span>
                    </div>

                    {/* Step 1: Service Selection */}
                    {step === 'service' && (
                        <div className="space-y-6 animate-in slide-in-from-right-4">
                            <h2 className="text-2xl font-bold text-charcoal">Select a Service</h2>
                            <div className="grid gap-4">
                                {menu?.systems?.map((sys: any, idx: number) => (
                                    <button
                                        key={idx}
                                        onClick={() => handleSystemSelect(sys)}
                                        className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all text-left flex justify-between items-center group"
                                        style={{ borderColor: 'transparent' }}
                                        onMouseEnter={(e) => e.currentTarget.style.borderColor = settings.themeColor}
                                        onMouseLeave={(e) => e.currentTarget.style.borderColor = 'transparent'}
                                    >
                                        <div>
                                            <h3 className="font-bold text-lg text-charcoal group-hover:text-pink-600 transition-colors" style={{ color: 'inherit' }}>{sys.system}</h3>
                                            <p className="text-gray-500 text-sm">{sys.description || 'Full set including cuticle care.'}</p>
                                            <div className="flex items-center mt-2 text-sm text-gray-400">
                                                <Clock size={14} className="mr-1" />
                                                <span>{sys.duration || 90} mins</span>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className="block font-bold text-xl text-charcoal">${sys.price}</span>
                                            <span className="text-xs text-gray-400">Starting at</span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Step 2: Date & Time */}
                    {step === 'datetime' && (
                        <div className="space-y-6 animate-in slide-in-from-right-4">
                            <button onClick={() => setStep('service')} className="text-gray-500 flex items-center hover:text-charcoal"><ArrowLeft size={16} className="mr-1" /> Back</button>
                            <h2 className="text-2xl font-bold text-charcoal">Choose a Time</h2>

                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                                {/* Simple Date Picker Mock */}
                                <div className="flex space-x-2 overflow-x-auto pb-4">
                                    {[0, 1, 2, 3, 4].map((offset) => {
                                        const date = addDays(new Date(), offset);
                                        const isSelected = selectedDate?.toDateString() === date.toDateString();
                                        return (
                                            <button
                                                key={offset}
                                                onClick={() => handleDateSelect(date)}
                                                className={`flex-shrink-0 w-20 h-24 rounded-xl flex flex-col items-center justify-center border transition-all ${isSelected ? 'text-white' : 'bg-white text-gray-600 border-gray-200'}`}
                                                style={{
                                                    backgroundColor: isSelected ? settings.themeColor : undefined,
                                                    borderColor: isSelected ? settings.themeColor : undefined
                                                }}
                                            >
                                                <span className="text-xs font-bold uppercase">{format(date, 'EEE')}</span>
                                                <span className="text-2xl font-bold">{format(date, 'd')}</span>
                                            </button>
                                        );
                                    })}
                                </div>

                                {selectedDate && (
                                    <div className="grid grid-cols-3 gap-3 mt-6 pt-6 border-t border-gray-100">
                                        {generateTimeSlots().map((time) => (
                                            <button
                                                key={time}
                                                onClick={() => { setSelectedTime(time); setStep('details'); }}
                                                className={`py-3 rounded-lg text-sm font-bold border transition-all ${selectedTime === time ? 'text-white' : 'bg-white text-charcoal border-gray-200'}`}
                                                style={{
                                                    backgroundColor: selectedTime === time ? settings.themeColor : undefined,
                                                    borderColor: selectedTime === time ? settings.themeColor : undefined
                                                }}
                                            >
                                                {time}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Step 3: Details */}
                    {step === 'details' && (
                        <div className="space-y-6 animate-in slide-in-from-right-4">
                            <button onClick={() => setStep('datetime')} className="text-gray-500 flex items-center hover:text-charcoal"><ArrowLeft size={16} className="mr-1" /> Back</button>
                            <h2 className="text-2xl font-bold text-charcoal">Your Details</h2>

                            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 space-y-4">
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1">Full Name</label>
                                        <input
                                            type="text"
                                            required
                                            value={clientName}
                                            onChange={(e) => setClientName(e.target.value)}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-0"
                                            style={{ borderColor: 'e5e7eb' }}
                                            onFocus={(e) => e.target.style.borderColor = settings.themeColor}
                                            onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                                            placeholder="Jane Doe"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1">Phone Number</label>
                                        <input
                                            type="tel"
                                            required
                                            value={clientPhone}
                                            onChange={(e) => setClientPhone(e.target.value)}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-0"
                                            style={{ borderColor: 'e5e7eb' }}
                                            onFocus={(e) => e.target.style.borderColor = settings.themeColor}
                                            onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                                            placeholder="(555) 123-4567"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1">Email (Optional)</label>
                                        <input
                                            type="email"
                                            value={clientEmail}
                                            onChange={(e) => setClientEmail(e.target.value)}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-0"
                                            style={{ borderColor: 'e5e7eb' }}
                                            onFocus={(e) => e.target.style.borderColor = settings.themeColor}
                                            onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                                            placeholder="jane@example.com"
                                        />
                                    </div>

                                    <div className="pt-4">
                                        <button
                                            type="submit"
                                            disabled={submitting}
                                            className="w-full text-white py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center disabled:opacity-70 hover:opacity-90"
                                            style={{ backgroundColor: settings.themeColor }}
                                        >
                                            {submitting ? <Loader2 className="animate-spin" /> : 'Confirm Booking'}
                                        </button>
                                        <p className="text-center text-xs text-gray-400 mt-4">
                                            By booking, you agree to {salon.salonName}'s policies.
                                        </p>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );

    if (settings.layout === 'split') {
        return (
            <div className="min-h-screen flex flex-col lg:flex-row bg-white">
                {/* Left Side - Hero/Brand */}
                <div className="hidden lg:block lg:w-1/2 relative bg-gray-900">
                    {settings.backgroundType === 'image' && (
                        <div
                            className="absolute inset-0 bg-cover bg-center"
                            style={{ backgroundImage: `url(${settings.backgroundValue})` }}
                        />
                    )}
                    {settings.backgroundType === 'gradient' && (
                        <div
                            className="absolute inset-0"
                            style={{ background: settings.backgroundValue }}
                        />
                    )}
                    {settings.backgroundType === 'solid' && (
                        <div
                            className="absolute inset-0"
                            style={{ backgroundColor: settings.backgroundValue }}
                        />
                    )}

                    <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />

                    <div className="absolute inset-0 flex flex-col justify-center px-16 text-white">
                        <h1 className="text-6xl font-bold font-display mb-6">{salon.salonName}</h1>
                        <div className="flex items-center text-xl opacity-90 mb-8">
                            <MapPin className="mr-2" />
                            {salon.location || 'Online'}
                        </div>
                        <p className="text-lg opacity-80 max-w-md leading-relaxed">
                            {salon.smartQuoteSettings?.welcomeMessage || "Welcome! Select a service to get started."}
                        </p>
                    </div>
                </div>

                {/* Right Side - Booking Flow */}
                <div className="flex-1 overflow-y-auto h-screen bg-white">
                    {/* Mobile Header for Split View */}
                    <div className="lg:hidden bg-white border-b border-gray-200 sticky top-0 z-10 px-6 py-4">
                        <h1 className="text-xl font-bold text-charcoal">{salon.salonName}</h1>
                    </div>

                    <div className="p-8 lg:p-16 max-w-2xl mx-auto">
                        <Content />
                    </div>
                </div>
            </div>
        );
    }

    // Default / Centered Layout
    return (
        <div className="min-h-screen pb-12 transition-colors duration-500" style={getBackgroundStyle()}>
            {/* Header */}
            <div className="bg-white/80 backdrop-blur-md border-b border-white/20 sticky top-0 z-10 shadow-sm">
                <div className="max-w-3xl mx-auto px-6 py-4 flex justify-between items-center">
                    <div>
                        <h1 className="text-xl font-bold text-charcoal">{salon.salonName}</h1>
                        <div className="flex items-center text-sm text-gray-500">
                            <MapPin size={14} className="mr-1" />
                            <span>{salon.location || 'Online'}</span>
                        </div>
                    </div>
                </div>
            </div>

            <Content />
        </div>
    );
}

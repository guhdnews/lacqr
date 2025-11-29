import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, addDoc, doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Loader2, MapPin, Check, Clock, ChevronRight, ArrowLeft } from 'lucide-react';
import { format, addDays } from 'date-fns';

export default function PublicBooking() {
    const { handle } = useParams();
    const [salon, setSalon] = useState<any>(null);
    const [menu, setMenu] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Booking State
    const [step, setStep] = useState<'service' | 'datetime' | 'details' | 'confirmation'>('service');
    const [selectedSystem, setSelectedSystem] = useState<any>(null);
    const [selectedAddons] = useState<any[]>([]);
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

                if (querySnapshot.empty) {
                    // Fallback: Try to find by ID if handle matches an ID (legacy)
                    const docRef = doc(db, 'users', handle!);
                    const docSnap = await getDoc(docRef);
                    if (docSnap.exists()) {
                        setSalon({ id: docSnap.id, ...docSnap.data() });
                        // Fetch Menu
                        const menuRef = doc(db, 'users', docSnap.id, 'serviceMenu', 'default');
                        const menuSnap = await getDoc(menuRef);
                        if (menuSnap.exists()) {
                            setMenu(menuSnap.data());
                        }
                        setLoading(false);
                        return;
                    }

                    setError('Salon not found.');
                    setLoading(false);
                    return;
                }

                const salonDoc = querySnapshot.docs[0];
                setSalon({ id: salonDoc.id, ...salonDoc.data() });

                // 2. Fetch Service Menu
                const menuRef = doc(db, 'users', salonDoc.id, 'serviceMenu', 'default');
                const menuSnap = await getDoc(menuRef);
                if (menuSnap.exists()) {
                    setMenu(menuSnap.data());
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

    const handleSystemSelect = (system: any) => {
        setSelectedSystem(system);
        setStep('datetime');
    };

    const handleDateSelect = (date: Date) => {
        setSelectedDate(date);
        setSelectedTime(null); // Reset time when date changes
    };

    const generateTimeSlots = () => {
        const slots = [];
        for (let i = 9; i <= 17; i++) {
            slots.push(`${i}:00`);
            slots.push(`${i}:30`);
        }
        return slots;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            // 1. Create/Find Client in Salon's CRM
            // Ideally check for duplicates by phone/email, but for now just add
            const clientData = {
                name: clientName,
                phone: clientPhone,
                email: clientEmail,
                createdAt: new Date(),
                lastVisit: new Date()
            };

            const clientRef = await addDoc(collection(db, 'users', salon.id, 'clients'), clientData);

            // 2. Create Appointment
            const appointmentData = {
                clientId: clientRef.id,
                clientName: clientName,
                date: new Date(), // Should combine selectedDate and selectedTime
                serviceDetails: {
                    base: selectedSystem,
                    addons: selectedAddons
                },
                totalPrice: selectedSystem.price, // + addons
                status: 'pending',
                createdAt: new Date()
            };

            await addDoc(collection(db, 'users', salon.id, 'appointments'), appointmentData);

            setStep('confirmation');
        } catch (err) {
            console.error("Booking failed:", err);
            alert("Booking failed. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>;
    if (error) return <div className="min-h-screen flex items-center justify-center text-red-500">{error}</div>;

    return (
        <div className="min-h-screen bg-gray-50 pb-12">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
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

            <div className="max-w-3xl mx-auto px-6 py-8">
                {step === 'confirmation' ? (
                    <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 text-center space-y-6 animate-in fade-in zoom-in-95">
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto text-green-600">
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
                            className="text-pink-600 font-bold hover:underline"
                        >
                            Book Another Appointment
                        </button>
                    </div>
                ) : (
                    <div className="space-y-8">
                        {/* Progress */}
                        <div className="flex items-center space-x-2 text-sm font-medium text-gray-400">
                            <span className={step === 'service' ? 'text-pink-600' : ''}>Service</span>
                            <ChevronRight size={14} />
                            <span className={step === 'datetime' ? 'text-pink-600' : ''}>Date & Time</span>
                            <ChevronRight size={14} />
                            <span className={step === 'details' ? 'text-pink-600' : ''}>Details</span>
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
                                            className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:border-pink-500 hover:shadow-md transition-all text-left flex justify-between items-center group"
                                        >
                                            <div>
                                                <h3 className="font-bold text-lg text-charcoal group-hover:text-pink-600 transition-colors">{sys.system}</h3>
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
                                                    className={`flex-shrink-0 w-20 h-24 rounded-xl flex flex-col items-center justify-center border transition-all ${isSelected ? 'bg-charcoal text-white border-charcoal' : 'bg-white text-gray-600 border-gray-200 hover:border-pink-300'}`}
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
                                                    className={`py-3 rounded-lg text-sm font-bold border transition-all ${selectedTime === time ? 'bg-pink-500 text-white border-pink-500' : 'bg-white text-charcoal border-gray-200 hover:border-pink-500'}`}
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
                                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-pink-500 focus:ring-0"
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
                                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-pink-500 focus:ring-0"
                                                placeholder="(555) 123-4567"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-1">Email (Optional)</label>
                                            <input
                                                type="email"
                                                value={clientEmail}
                                                onChange={(e) => setClientEmail(e.target.value)}
                                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-pink-500 focus:ring-0"
                                                placeholder="jane@example.com"
                                            />
                                        </div>

                                        <div className="pt-4">
                                            <button
                                                type="submit"
                                                disabled={submitting}
                                                className="w-full bg-charcoal text-white py-4 rounded-xl font-bold text-lg hover:bg-black transition-all flex items-center justify-center disabled:opacity-70"
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
        </div>
    );
}

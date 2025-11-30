import { useState, useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { User, Building2, CreditCard, Sparkles, Check, Layout } from 'lucide-react';
import BookingPageBuilder from '../components/BookingPageBuilder';

export default function Settings() {
    const { user, setUser } = useAppStore();
    const [activeTab, setActiveTab] = useState<'profile' | 'salon' | 'smart-quote' | 'booking-page' | 'payments'>('profile');
    const [loading, setLoading] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);

    // Profile State
    const [name, setName] = useState(user?.name || '');
    const [phone, setPhone] = useState('');

    // Salon State
    const [salonName, setSalonName] = useState('');
    const [currency, setCurrency] = useState('USD');

    // Smart Quote State
    const [bookingHandle, setBookingHandle] = useState('');
    const [welcomeMessage, setWelcomeMessage] = useState('');

    // Payments State
    const [stripeConnected, setStripeConnected] = useState(false);

    useEffect(() => {
        if (user?.id) {
            const fetchSettings = async () => {
                const docRef = doc(db, 'users', user.id!);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    setName(data.name || user.name || '');
                    setPhone(data.phone || '');
                    setSalonName(data.salonName || '');
                    setCurrency(data.currency || 'USD');
                    setBookingHandle(data.bookingHandle || '');
                    setWelcomeMessage(data.welcomeMessage || '');
                    setStripeConnected(data.stripeConnected || false);
                }
            };
            fetchSettings();
        }
    }, [user?.id]);

    const handleSave = async () => {
        if (!user?.id) return;
        setLoading(true);
        try {
            const docRef = doc(db, 'users', user.id);
            await updateDoc(docRef, {
                name,
                phone,
                salonName,
                currency,
                bookingHandle,
                welcomeMessage,
                stripeConnected
            });

            // Update local store if name changed
            if (name !== user.name) {
                setUser({ ...user, name });
            }

            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 3000);
        } catch (error) {
            console.error("Error saving settings:", error);
            alert("Failed to save settings.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col md:flex-row min-h-[calc(100vh-4rem)] max-w-6xl mx-auto p-4 md:p-6 gap-6 md:gap-8">
            {/* Sidebar Navigation */}
            <div className="w-full md:w-64 flex-shrink-0">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-2 md:p-4 flex overflow-x-auto md:block space-x-2 md:space-x-0 md:space-y-2 scrollbar-hide">
                    <button
                        onClick={() => setActiveTab('profile')}
                        className={`flex-shrink-0 flex items-center space-x-2 md:space-x-3 px-3 md:px-4 py-2 md:py-3 rounded-xl transition-all whitespace-nowrap ${activeTab === 'profile' ? 'bg-pink-50 text-pink-600 font-bold' : 'text-gray-600 hover:bg-gray-50'}`}
                    >
                        <User size={18} className="md:w-5 md:h-5" />
                        <span className="text-sm md:text-base">Profile</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('salon')}
                        className={`flex-shrink-0 flex items-center space-x-2 md:space-x-3 px-3 md:px-4 py-2 md:py-3 rounded-xl transition-all whitespace-nowrap ${activeTab === 'salon' ? 'bg-pink-50 text-pink-600 font-bold' : 'text-gray-600 hover:bg-gray-50'}`}
                    >
                        <Building2 size={18} className="md:w-5 md:h-5" />
                        <span className="text-sm md:text-base">Salon Details</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('smart-quote')}
                        className={`flex-shrink-0 flex items-center space-x-2 md:space-x-3 px-3 md:px-4 py-2 md:py-3 rounded-xl transition-all whitespace-nowrap ${activeTab === 'smart-quote' ? 'bg-pink-50 text-pink-600 font-bold' : 'text-gray-600 hover:bg-gray-50'}`}
                    >
                        <Sparkles size={18} className="md:w-5 md:h-5" />
                        <span className="text-sm md:text-base">Smart Quote</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('booking-page')}
                        className={`flex-shrink-0 flex items-center space-x-2 md:space-x-3 px-3 md:px-4 py-2 md:py-3 rounded-xl transition-all whitespace-nowrap ${activeTab === 'booking-page' ? 'bg-pink-50 text-pink-600 font-bold' : 'text-gray-600 hover:bg-gray-50'}`}
                    >
                        <Layout size={18} className="md:w-5 md:h-5" />
                        <span className="text-sm md:text-base">Booking Page</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('payments')}
                        className={`flex-shrink-0 flex items-center space-x-2 md:space-x-3 px-3 md:px-4 py-2 md:py-3 rounded-xl transition-all whitespace-nowrap ${activeTab === 'payments' ? 'bg-pink-50 text-pink-600 font-bold' : 'text-gray-600 hover:bg-gray-50'}`}
                    >
                        <CreditCard size={18} className="md:w-5 md:h-5" />
                        <span className="text-sm md:text-base">Payments</span>
                    </button>
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 min-w-0">
                {/* PROFILE TAB */}
                {activeTab === 'profile' && (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 animate-in fade-in slide-in-from-bottom-4">
                        <h2 className="text-2xl font-black text-charcoal mb-6">Your Profile</h2>
                        <div className="space-y-6 max-w-lg">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Full Name</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full p-3 rounded-xl border border-gray-200 focus:border-pink-500 focus:ring-0 transition-colors"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Phone Number</label>
                                <input
                                    type="tel"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    className="w-full p-3 rounded-xl border border-gray-200 focus:border-pink-500 focus:ring-0 transition-colors"
                                    placeholder="(555) 123-4567"
                                />
                            </div>
                            <div className="pt-4">
                                <button
                                    onClick={handleSave}
                                    disabled={loading}
                                    className="bg-charcoal text-white px-6 py-3 rounded-xl font-bold hover:bg-black transition-colors disabled:opacity-50"
                                >
                                    {loading ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* SALON TAB */}
                {activeTab === 'salon' && (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 animate-in fade-in slide-in-from-bottom-4">
                        <h2 className="text-2xl font-black text-charcoal mb-6">Salon Details</h2>
                        <div className="space-y-6 max-w-lg">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Salon Name</label>
                                <input
                                    type="text"
                                    value={salonName}
                                    onChange={(e) => setSalonName(e.target.value)}
                                    className="w-full p-3 rounded-xl border border-gray-200 focus:border-pink-500 focus:ring-0 transition-colors"
                                    placeholder="e.g. Luxe Nails"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Currency</label>
                                <select
                                    value={currency}
                                    onChange={(e) => setCurrency(e.target.value)}
                                    className="w-full p-3 rounded-xl border border-gray-200 focus:border-pink-500 focus:ring-0 transition-colors"
                                >
                                    <option value="USD">USD ($)</option>
                                    <option value="EUR">EUR (€)</option>
                                    <option value="GBP">GBP (£)</option>
                                    <option value="CAD">CAD ($)</option>
                                    <option value="AUD">AUD ($)</option>
                                </select>
                            </div>
                            <div className="pt-4">
                                <button
                                    onClick={handleSave}
                                    disabled={loading}
                                    className="bg-charcoal text-white px-6 py-3 rounded-xl font-bold hover:bg-black transition-colors disabled:opacity-50"
                                >
                                    {loading ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* SMART QUOTE TAB */}
                {activeTab === 'smart-quote' && (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 animate-in fade-in slide-in-from-bottom-4">
                        <h2 className="text-2xl font-black text-charcoal mb-6">Smart Quote Settings</h2>
                        <div className="space-y-6 max-w-lg">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Booking Handle (URL)</label>
                                <div className="flex items-center">
                                    <span className="text-gray-500 bg-gray-50 border border-r-0 border-gray-200 rounded-l-xl px-3 py-3">lacqr.io/book/</span>
                                    <input
                                        type="text"
                                        value={bookingHandle}
                                        onChange={(e) => setBookingHandle(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                                        className="flex-1 p-3 rounded-r-xl border border-gray-200 focus:border-pink-500 focus:ring-0 transition-colors"
                                        placeholder="your-salon-name"
                                    />
                                </div>
                                <p className="text-xs text-gray-500 mt-1">This is your public booking link.</p>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Welcome Message</label>
                                <textarea
                                    value={welcomeMessage}
                                    onChange={(e) => setWelcomeMessage(e.target.value)}
                                    className="w-full p-3 rounded-xl border border-gray-200 focus:border-pink-500 focus:ring-0 transition-colors"
                                    rows={3}
                                    placeholder="Welcome to Luxe Nails! Please upload a photo for a quote."
                                />
                            </div>
                            <div className="pt-4">
                                <button
                                    onClick={handleSave}
                                    disabled={loading}
                                    className="bg-charcoal text-white px-6 py-3 rounded-xl font-bold hover:bg-black transition-colors disabled:opacity-50"
                                >
                                    {loading ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* BOOKING PAGE TAB */}
                {activeTab === 'booking-page' && (
                    <BookingPageBuilder />
                )}

                {/* PAYMENTS TAB */}
                {activeTab === 'payments' && (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 animate-in fade-in slide-in-from-bottom-4">
                        <h2 className="text-2xl font-black text-charcoal mb-6">Payments</h2>
                        <div className="space-y-6 max-w-lg">
                            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center space-x-3">
                                        <div className="bg-white p-2 rounded-lg shadow-sm">
                                            <CreditCard className="text-purple-600" size={24} />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-charcoal">Stripe Connect</h3>
                                            <p className="text-sm text-gray-500">Accept card payments securely</p>
                                        </div>
                                    </div>
                                    <div className={`h-3 w-3 rounded-full ${stripeConnected ? 'bg-green-500' : 'bg-gray-300'}`} />
                                </div>

                                {stripeConnected ? (
                                    <button
                                        onClick={() => setStripeConnected(false)}
                                        className="w-full py-2 border border-gray-300 rounded-lg text-sm font-bold text-gray-600 hover:bg-gray-100 transition-colors"
                                    >
                                        Disconnect Stripe
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => setStripeConnected(true)}
                                        className="w-full py-2 bg-[#635BFF] text-white rounded-lg text-sm font-bold hover:bg-[#534be0] transition-colors flex items-center justify-center"
                                    >
                                        Connect with Stripe
                                    </button>
                                )}
                            </div>

                            <div className="pt-4">
                                <button
                                    onClick={handleSave}
                                    disabled={loading}
                                    className="bg-charcoal text-white px-6 py-3 rounded-xl font-bold hover:bg-black transition-colors disabled:opacity-50"
                                >
                                    {loading ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Success Toast */}
            {saveSuccess && (
                <div className="fixed bottom-8 right-8 bg-charcoal text-white px-6 py-3 rounded-xl shadow-lg flex items-center animate-in slide-in-from-bottom-4 fade-in">
                    <Check size={20} className="mr-2 text-green-400" />
                    <span className="font-bold">Settings saved successfully!</span>
                </div>
            )}
        </div>
    );
}

import { useState, useEffect } from 'react';
import { User, CreditCard, LogOut, Store, DollarSign, Sparkles, Save, AlertCircle, ExternalLink, Check, Copy } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { doc, getDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { useNavigate, Link } from 'react-router-dom';

export default function Settings() {
    const { user, setUser } = useAppStore();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'profile' | 'salon' | 'smart-quote' | 'payments'>('profile');

    // Profile State
    const [displayName, setDisplayName] = useState(user?.name || "");
    const [phone, setPhone] = useState("");
    const [isSavingProfile, setIsSavingProfile] = useState(false);

    // Salon State
    const [salonName, setSalonName] = useState("");
    const [currency, setCurrency] = useState("USD");
    const [isSavingSalon, setIsSavingSalon] = useState(false);

    // Smart Quote / Booking State
    const [welcomeMessage, setWelcomeMessage] = useState("");
    const [slug, setSlug] = useState("");
    const [originalSlug, setOriginalSlug] = useState("");
    const [slugError, setSlugError] = useState("");
    const [isSavingQuote, setIsSavingQuote] = useState(false);
    const [copiedLink, setCopiedLink] = useState(false);

    // Payments State
    const [isStripeConnected, setIsStripeConnected] = useState(false);
    const [isSavingPayments, setIsSavingPayments] = useState(false);

    const [saveSuccess, setSaveSuccess] = useState(false);

    // Fetch Settings
    useEffect(() => {
        const fetchSettings = async () => {
            if (user?.id) {
                try {
                    const docRef = doc(db, 'users', user.id);
                    const snapshot = await getDoc(docRef);
                    if (snapshot.exists()) {
                        const data = snapshot.data();
                        setDisplayName(data.name || user.name || "");
                        setPhone(data.phone || "");
                        setSalonName(data.salonName || "");
                        setCurrency(data.currency || "USD");
                        setWelcomeMessage(data.smartQuoteSettings?.welcomeMessage || "");
                        setSlug(data.bookingHandle || data.slug || user.id);
                        setOriginalSlug(data.bookingHandle || data.slug || user.id);
                        setIsStripeConnected(data.isStripeConnected || false);
                    }
                } catch (error) {
                    console.error("Error fetching settings:", error);
                }
            }
        };
        fetchSettings();
    }, [user]);

    const handleSaveProfile = async () => {
        if (!user?.id) return;
        setIsSavingProfile(true);
        try {
            const docRef = doc(db, 'users', user.id);
            await updateDoc(docRef, {
                name: displayName,
                phone: phone
            });
            setUser({ ...user, name: displayName });
            showSuccess();
        } catch (error) {
            console.error("Error saving profile:", error);
            alert("Failed to save profile.");
        } finally {
            setIsSavingProfile(false);
        }
    };

    const handleSaveSalon = async () => {
        if (!user?.id) return;
        setIsSavingSalon(true);
        try {
            const docRef = doc(db, 'users', user.id);
            await updateDoc(docRef, {
                salonName,
                currency
            });
            showSuccess();
        } catch (error) {
            console.error("Error saving salon:", error);
            alert("Failed to save salon settings.");
        } finally {
            setIsSavingSalon(false);
        }
    };

    const handleSaveSmartQuote = async () => {
        if (!user?.id) return;
        setSlugError("");
        setIsSavingQuote(true);

        try {
            if (slug !== originalSlug) {
                const slugQuery = query(collection(db, 'users'), where('bookingHandle', '==', slug));
                const slugSnapshot = await getDocs(slugQuery);
                if (!slugSnapshot.empty) {
                    setSlugError("This handle is already taken.");
                    setIsSavingQuote(false);
                    return;
                }
            }

            const docRef = doc(db, 'users', user.id);
            await updateDoc(docRef, {
                'smartQuoteSettings.welcomeMessage': welcomeMessage,
                bookingHandle: slug,
                slug: slug // Keep legacy slug field synced for now
            });
            setOriginalSlug(slug);
            showSuccess();
        } catch (error) {
            console.error("Error saving settings:", error);
            alert("Failed to save settings.");
        } finally {
            setIsSavingQuote(false);
        }
    };

    const handleToggleStripe = async () => {
        if (!user?.id) return;
        setIsSavingPayments(true);
        try {
            const newState = !isStripeConnected;
            const docRef = doc(db, 'users', user.id);
            await updateDoc(docRef, { isStripeConnected: newState });
            setIsStripeConnected(newState);
            showSuccess();
        } catch (error) {
            console.error("Error updating stripe:", error);
        } finally {
            setIsSavingPayments(false);
        }
    };

    const showSuccess = () => {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 2000);
    };

    const handleLogout = async () => {
        try {
            await auth.signOut();
            setUser({
                id: null,
                name: null,
                email: null,
                isAuthenticated: false,
                onboardingComplete: false
            });
            navigate('/login');
        } catch (error) {
            console.error("Logout failed", error);
        }
    };

    const publicLink = `${window.location.origin}/book/${slug || user?.id}`;

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2000);
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-12">
            <div>
                <h2 className="text-3xl font-bold tracking-tight font-serif text-charcoal">Settings</h2>
                <p className="text-gray-500 mt-2">Manage your account and business preferences.</p>
            </div>

            <div className="flex flex-col md:flex-row gap-8">
                {/* Sidebar Navigation */}
                <div className="w-full md:w-64 flex-shrink-0 space-y-2">
                    <button
                        onClick={() => setActiveTab('profile')}
                        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'profile' ? 'bg-pink-50 text-pink-600 font-bold' : 'text-gray-600 hover:bg-gray-50'}`}
                    >
                        <User size={20} />
                        <span>Profile</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('salon')}
                        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'salon' ? 'bg-pink-50 text-pink-600 font-bold' : 'text-gray-600 hover:bg-gray-50'}`}
                    >
                        <Store size={20} />
                        <span>Salon Details</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('smart-quote')}
                        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'smart-quote' ? 'bg-pink-50 text-pink-600 font-bold' : 'text-gray-600 hover:bg-gray-50'}`}
                    >
                        <Sparkles size={20} />
                        <span>Smart Quote</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('payments')}
                        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'payments' ? 'bg-pink-50 text-pink-600 font-bold' : 'text-gray-600 hover:bg-gray-50'}`}
                    >
                        <CreditCard size={20} />
                        <span>Payments</span>
                    </button>

                    <div className="pt-4 border-t border-gray-100 mt-4">
                        <Link
                            to="/service-menu"
                            className="w-full flex items-center space-x-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-xl transition-colors"
                        >
                            <ExternalLink size={20} />
                            <span>Edit Service Menu</span>
                        </Link>
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center space-x-3 px-4 py-3 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                        >
                            <LogOut size={20} />
                            <span>Log Out</span>
                        </button>
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 min-w-0">
                    {/* PROFILE TAB */}
                    {activeTab === 'profile' && (
                        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 space-y-6">
                            <h3 className="text-xl font-bold text-charcoal">Profile Details</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Display Name</label>
                                    <input
                                        type="text"
                                        value={displayName}
                                        onChange={(e) => setDisplayName(e.target.value)}
                                        className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:border-pink-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                                    <input
                                        type="tel"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:border-pink-500"
                                        placeholder="(555) 123-4567"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                                    <input
                                        type="email"
                                        value={user?.email || ""}
                                        disabled
                                        className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-500 cursor-not-allowed"
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end">
                                <button
                                    onClick={handleSaveProfile}
                                    disabled={isSavingProfile}
                                    className="bg-charcoal text-white px-6 py-3 rounded-xl font-bold hover:bg-black transition-colors flex items-center disabled:opacity-70"
                                >
                                    {isSavingProfile ? <span className="animate-pulse">Saving...</span> : (
                                        <>
                                            <Save size={18} className="mr-2" />
                                            Save Changes
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* SALON TAB */}
                    {activeTab === 'salon' && (
                        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 space-y-6">
                            <h3 className="text-xl font-bold text-charcoal">Salon Details</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Salon Name</label>
                                    <input
                                        type="text"
                                        value={salonName}
                                        onChange={(e) => setSalonName(e.target.value)}
                                        className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:border-pink-500"
                                        placeholder="e.g. Luxe Nails"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
                                    <select
                                        value={currency}
                                        onChange={(e) => setCurrency(e.target.value)}
                                        className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:border-pink-500 bg-white"
                                    >
                                        <option value="USD">USD ($)</option>
                                        <option value="EUR">EUR (€)</option>
                                        <option value="GBP">GBP (£)</option>
                                        <option value="CAD">CAD ($)</option>
                                        <option value="AUD">AUD ($)</option>
                                    </select>
                                </div>
                            </div>
                            <div className="flex justify-end">
                                <button
                                    onClick={handleSaveSalon}
                                    disabled={isSavingSalon}
                                    className="bg-charcoal text-white px-6 py-3 rounded-xl font-bold hover:bg-black transition-colors flex items-center disabled:opacity-70"
                                >
                                    {isSavingSalon ? <span className="animate-pulse">Saving...</span> : (
                                        <>
                                            <Save size={18} className="mr-2" />
                                            Save Changes
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* SMART QUOTE TAB */}
                    {activeTab === 'smart-quote' && (
                        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 space-y-6">
                            <h3 className="text-xl font-bold text-charcoal">Smart Quote Settings</h3>

                            <div className="bg-pink-50 p-4 rounded-xl flex items-start space-x-3">
                                <Sparkles className="text-pink-500 mt-1 flex-shrink-0" size={20} />
                                <div>
                                    <h4 className="font-bold text-pink-800 text-sm">Your Booking Link</h4>
                                    <p className="text-pink-700 text-sm mb-2">Share this link with clients to let them get an instant quote and book.</p>
                                    <div className="flex items-center space-x-2 bg-white p-2 rounded-lg border border-pink-200">
                                        <code className="text-xs text-gray-600 flex-1 truncate">{publicLink}</code>
                                        <button
                                            onClick={() => copyToClipboard(publicLink)}
                                            className="text-pink-500 hover:text-pink-700 p-1"
                                        >
                                            {copiedLink ? <Check size={16} /> : <Copy size={16} />}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Booking Handle</label>
                                    <div className="flex items-center">
                                        <span className="text-gray-400 mr-2">lacqr.com/book/</span>
                                        <input
                                            type="text"
                                            value={slug}
                                            onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                                            className="flex-1 p-3 border border-gray-200 rounded-xl focus:outline-none focus:border-pink-500"
                                        />
                                    </div>
                                    {slugError && <p className="text-red-500 text-sm mt-1 flex items-center"><AlertCircle size={14} className="mr-1" /> {slugError}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Welcome Message</label>
                                    <textarea
                                        value={welcomeMessage}
                                        onChange={(e) => setWelcomeMessage(e.target.value)}
                                        rows={3}
                                        className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:border-pink-500"
                                        placeholder="e.g. Welcome to Luxe Nails! Upload your inspo pic to get started."
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end">
                                <button
                                    onClick={handleSaveSmartQuote}
                                    disabled={isSavingQuote}
                                    className="bg-charcoal text-white px-6 py-3 rounded-xl font-bold hover:bg-black transition-colors flex items-center disabled:opacity-70"
                                >
                                    {isSavingQuote ? <span className="animate-pulse">Saving...</span> : (
                                        <>
                                            <Save size={18} className="mr-2" />
                                            Save Changes
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* PAYMENTS TAB */}
                    {activeTab === 'payments' && (
                        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 space-y-6">
                            <h3 className="text-xl font-bold text-charcoal">Payment Integration</h3>

                            <div className="border border-gray-200 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-4">
                                <div className="flex items-center space-x-4">
                                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                                        <DollarSign className="text-gray-600" size={24} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-lg text-charcoal">Stripe</h4>
                                        <p className="text-gray-500 text-sm">Accept credit cards and automated deposits.</p>
                                    </div>
                                </div>
                                <button
                                    onClick={handleToggleStripe}
                                    disabled={isSavingPayments}
                                    className={`px-6 py-3 rounded-xl font-bold transition-all flex items-center space-x-2 ${isStripeConnected ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-[#635BFF] text-white hover:bg-[#534be0]'}`}
                                >
                                    {isStripeConnected ? (
                                        <>
                                            <Check size={18} />
                                            <span>Connected</span>
                                        </>
                                    ) : (
                                        <span>Connect Stripe</span>
                                    )}
                                </button>
                            </div>

                            {isStripeConnected && (
                                <div className="bg-gray-50 p-4 rounded-xl text-sm text-gray-600">
                                    <p>Your Stripe account is active. Payouts are scheduled daily.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
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

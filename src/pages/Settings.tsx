import { useState, useEffect } from 'react';
import { User, CreditCard, LogOut, Copy, Check, ExternalLink, Sparkles, Save, AlertCircle } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { doc, getDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { useNavigate } from 'react-router-dom';

export default function Settings() {
    const { user, setUser } = useAppStore();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'profile' | 'smart-quote' | 'subscription'>('profile');

    // Profile State
    const [displayName, setDisplayName] = useState(user?.name || "");
    const [isSavingProfile, setIsSavingProfile] = useState(false);

    // Smart Quote State
    const [welcomeMessage, setWelcomeMessage] = useState("");
    const [slug, setSlug] = useState("");
    const [originalSlug, setOriginalSlug] = useState("");
    const [slugError, setSlugError] = useState("");
    const [isSavingQuote, setIsSavingQuote] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [copiedLink, setCopiedLink] = useState(false);
    const [copiedEmbed, setCopiedEmbed] = useState(false);

    // Fetch Settings
    useEffect(() => {
        const fetchSettings = async () => {
            if (user?.id) {
                try {
                    const docRef = doc(db, 'users', user.id);
                    const snapshot = await getDoc(docRef);
                    if (snapshot.exists()) {
                        const data = snapshot.data();
                        setWelcomeMessage(data.smartQuoteSettings?.welcomeMessage || "");
                        setSlug(data.slug || user.id); // Default to ID if no slug
                        setOriginalSlug(data.slug || user.id);
                        setDisplayName(data.name || user.name || "");
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
            await updateDoc(docRef, { name: displayName });
            setUser({ ...user, name: displayName }); // Update local store
            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 2000);
        } catch (error) {
            console.error("Error saving profile:", error);
            alert("Failed to save profile.");
        } finally {
            setIsSavingProfile(false);
        }
    };

    const handleSaveSmartQuote = async () => {
        if (!user?.id) return;
        setSlugError("");
        setIsSavingQuote(true);

        try {
            // Check slug uniqueness if changed
            if (slug !== originalSlug) {
                const slugQuery = query(collection(db, 'users'), where('slug', '==', slug));
                const slugSnapshot = await getDocs(slugQuery);
                if (!slugSnapshot.empty) {
                    setSlugError("This link is already taken. Please choose another.");
                    setIsSavingQuote(false);
                    return;
                }
            }

            const docRef = doc(db, 'users', user.id);
            await updateDoc(docRef, {
                'smartQuoteSettings.welcomeMessage': welcomeMessage,
                slug: slug
            });
            setOriginalSlug(slug);
            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 2000);
        } catch (error) {
            console.error("Error saving settings:", error);
            alert("Failed to save settings.");
        } finally {
            setIsSavingQuote(false);
        }
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
    const iframeCode = `<iframe src="${window.location.origin}/embed/${user?.id}" width="100%" height="600" frameborder="0"></iframe>`;

    const copyToClipboard = (text: string, setCopied: (val: boolean) => void) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-12">
            <div>
                <h2 className="text-3xl font-bold tracking-tight font-serif text-charcoal">Settings</h2>
                <p className="text-gray-500 mt-2">Manage your account, profile, and Smart Quote preferences.</p>
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
                        onClick={() => setActiveTab('smart-quote')}
                        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'smart-quote' ? 'bg-pink-50 text-pink-600 font-bold' : 'text-gray-600 hover:bg-gray-50'}`}
                    >
                        <Sparkles size={20} />
                        <span>Smart Quote</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('subscription')}
                        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'subscription' ? 'bg-pink-50 text-pink-600 font-bold' : 'text-gray-600 hover:bg-gray-50'}`}
                    >
                        <CreditCard size={20} />
                        <span>Subscription</span>
                    </button>
                    <div className="pt-4 border-t border-gray-100 mt-4">
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
                    {activeTab === 'profile' && (
                        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 space-y-6">
                            <h3 className="text-xl font-bold text-charcoal">Profile Details</h3>

                            <div className="flex items-center space-x-6">
                                <div className="w-20 h-20 bg-pink-100 rounded-full flex items-center justify-center text-pink-600 font-bold text-2xl uppercase">
                                    {displayName.substring(0, 2) || 'JD'}
                                </div>
                                <div>
                                    <button className="text-sm font-bold text-pink-500 hover:text-pink-600 border border-pink-200 px-4 py-2 rounded-lg hover:bg-pink-50 transition-colors">
                                        Change Avatar
                                    </button>
                                </div>
                            </div>

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
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                                    <input
                                        type="email"
                                        value={user?.email || ""}
                                        disabled
                                        className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-500 cursor-not-allowed"
                                    />
                                </div>
                            </div>

                            <div className="pt-4 flex justify-end">
                                <button
                                    onClick={handleSaveProfile}
                                    disabled={isSavingProfile}
                                    className="flex items-center space-x-2 bg-charcoal text-white px-6 py-3 rounded-xl font-bold hover:bg-black transition-colors disabled:opacity-50"
                                >
                                    {isSavingProfile ? <span>Saving...</span> : <> <Save size={18} /> <span>Save Profile</span> </>}
                                </button>
                            </div>
                        </div>
                    )}

                    {activeTab === 'smart-quote' && (
                        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 space-y-8">
                            <div>
                                <h3 className="text-xl font-bold text-charcoal mb-2">Smart Quote Integration</h3>
                                <p className="text-gray-500 text-sm">Customize how clients book with you.</p>
                            </div>

                            {/* Custom Link */}
                            <div className="bg-pink-50/50 p-6 rounded-2xl border border-pink-100">
                                <label className="block text-sm font-bold text-gray-900 mb-2">Your Custom Booking Link</label>
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-gray-500 font-mono text-sm">{window.location.origin}/book/</span>
                                    <input
                                        type="text"
                                        value={slug}
                                        onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                                        placeholder="your-salon-name"
                                        className="flex-1 p-2 border border-gray-200 rounded-lg font-mono text-sm focus:outline-none focus:border-pink-500"
                                    />
                                </div>
                                {slugError && (
                                    <p className="text-red-500 text-xs flex items-center gap-1 mt-1">
                                        <AlertCircle size={12} /> {slugError}
                                    </p>
                                )}
                                <div className="flex items-center justify-between mt-4">
                                    <a href={publicLink} target="_blank" rel="noopener noreferrer" className="text-sm text-pink-500 font-bold hover:underline flex items-center gap-1">
                                        Test Link <ExternalLink size={14} />
                                    </a>
                                    <button
                                        onClick={() => copyToClipboard(publicLink, setCopiedLink)}
                                        className="text-sm text-gray-500 hover:text-charcoal flex items-center gap-1"
                                    >
                                        {copiedLink ? <Check size={14} /> : <Copy size={14} />} Copy Link
                                    </button>
                                </div>
                            </div>

                            {/* Welcome Message */}
                            <div>
                                <label className="block text-sm font-bold text-gray-900 mb-2">Welcome Message</label>
                                <p className="text-xs text-gray-500 mb-2">This text appears above the upload button on your public page.</p>
                                <textarea
                                    value={welcomeMessage}
                                    onChange={(e) => setWelcomeMessage(e.target.value)}
                                    placeholder="e.g., Upload your inspo pic to get an instant quote!"
                                    className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:border-pink-500 min-h-[100px] text-sm"
                                />
                            </div>

                            {/* Embed Code */}
                            <div>
                                <label className="block text-sm font-bold text-gray-900 mb-2">Website Embed Code</label>
                                <div className="relative">
                                    <pre className="bg-gray-900 text-gray-300 rounded-xl p-4 text-xs font-mono overflow-x-auto">
                                        {iframeCode}
                                    </pre>
                                    <button
                                        onClick={() => copyToClipboard(iframeCode, setCopiedEmbed)}
                                        className="absolute top-2 right-2 p-2 bg-white/10 hover:bg-white/20 rounded text-white transition-colors"
                                    >
                                        {copiedEmbed ? <Check size={14} /> : <Copy size={14} />}
                                    </button>
                                </div>
                            </div>

                            <div className="pt-4 flex justify-end border-t border-gray-100">
                                <button
                                    onClick={handleSaveSmartQuote}
                                    disabled={isSavingQuote}
                                    className="flex items-center space-x-2 bg-pink-500 text-white px-6 py-3 rounded-xl font-bold hover:bg-pink-600 transition-colors disabled:opacity-50"
                                >
                                    {isSavingQuote ? <span>Saving...</span> : saveSuccess ? <span>Saved!</span> : <> <Save size={18} /> <span>Save Changes</span> </>}
                                </button>
                            </div>
                        </div>
                    )}

                    {activeTab === 'subscription' && (
                        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                            <h3 className="text-xl font-bold text-charcoal mb-6">Subscription Plan</h3>

                            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-8 border border-pink-100">
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <p className="font-bold text-charcoal text-2xl">Beta Founder Plan</p>
                                        <p className="text-pink-600 font-medium">Active</p>
                                    </div>
                                    <span className="bg-black text-white px-4 py-1 rounded-full text-sm font-bold">
                                        Free
                                    </span>
                                </div>
                                <p className="text-gray-600 mb-6 leading-relaxed">
                                    Thank you for being an early adopter! You have full access to all features during the beta period.
                                    We will notify you before any billing changes occur.
                                </p>
                                <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
                                    <Check size={16} className="text-green-500" /> Unlimited Scans
                                    <span className="mx-2">•</span>
                                    <Check size={16} className="text-green-500" /> Smart Quote
                                    <span className="mx-2">•</span>
                                    <Check size={16} className="text-green-500" /> Client Management
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

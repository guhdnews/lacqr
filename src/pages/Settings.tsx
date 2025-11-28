import { useState, useEffect } from 'react';
import { User, Bell, Shield, CreditCard, LogOut, Copy, Check, ExternalLink, Code } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { FLAGS } from '../config/flags';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { useNavigate } from 'react-router-dom';

export default function Settings() {
    const { user, setUser } = useAppStore();
    const navigate = useNavigate();

    // Smart Quote State
    const [welcomeMessage, setWelcomeMessage] = useState("");
    const [isSaving, setIsSaving] = useState(false);
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
                        setWelcomeMessage(snapshot.data().smartQuoteSettings?.welcomeMessage || "");
                    }
                } catch (error) {
                    console.error("Error fetching settings:", error);
                }
            }
        };
        fetchSettings();
    }, [user]);

    const handleSaveSmartQuote = async () => {
        if (!user?.id) return;
        setIsSaving(true);
        try {
            const docRef = doc(db, 'users', user.id);
            await updateDoc(docRef, {
                'smartQuoteSettings.welcomeMessage': welcomeMessage
            });
            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 2000);
        } catch (error) {
            console.error("Error saving settings:", error);
            alert("Failed to save settings.");
        } finally {
            setIsSaving(false);
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

    const publicLink = user?.id ? `${window.location.origin}/book/${user.id}` : '';
    const embedCode = user?.id ? `<script src="${window.location.origin}/widget.js" data-user="${user.id}"></script>` : '';
    const iframeCode = user?.id ? `<iframe src="${window.location.origin}/embed/${user.id}" width="100%" height="600" frameborder="0"></iframe>` : '';

    const copyToClipboard = (text: string, setCopied: (val: boolean) => void) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="max-w-2xl mx-auto space-y-8 pb-12">
            <div>
                <h2 className="text-3xl font-bold tracking-tight font-serif">Settings</h2>
                <p className="text-gray-500 mt-2">Manage your account preferences and subscription.</p>
            </div>

            {/* Profile Section */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center space-x-4 mb-6">
                    <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center text-pink-600 font-bold text-xl uppercase">
                        {user?.name?.substring(0, 2) || 'JD'}
                    </div>
                    <div>
                        <h3 className="font-bold text-lg">{user?.name || 'User'}</h3>
                        <p className="text-gray-500 text-sm">{user?.email || 'email@example.com'}</p>
                    </div>
                    {/* <button className="ml-auto text-sm font-medium text-pink-600 hover:text-pink-700">
                        Edit Profile
                    </button> */}
                </div>

                <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl cursor-not-allowed opacity-60">
                        <div className="flex items-center space-x-3">
                            <User size={20} className="text-gray-400" />
                            <span className="font-medium">Account Details</span>
                        </div>
                        <span className="text-gray-400">›</span>
                    </div>
                    {/* <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                        <div className="flex items-center space-x-3">
                            <Shield size={20} className="text-gray-400" />
                            <span className="font-medium">Security & Password</span>
                        </div>
                        <span className="text-gray-400">›</span>
                    </div> */}
                </div>
            </div>

            {/* Booking Integration Section (Smart Quote Settings) */}
            <div className="bg-white rounded-3xl shadow-sm border border-pink-100 overflow-hidden">
                <div className="p-6 border-b border-pink-50 bg-pink-50/30">
                    <h2 className="text-xl font-serif font-bold text-charcoal">Smart Quote Integration</h2>
                    <p className="text-gray-500 text-sm mt-1">Connect Lacqr with your existing booking flow.</p>
                </div>
                <div className="p-6 space-y-8">
                    {/* Direct Link */}
                    <div>
                        <div className="flex items-center space-x-2 text-pink-500 mb-2">
                            <ExternalLink size={18} />
                            <label className="block text-sm font-bold text-gray-900">Your Personal Booking Link</label>
                        </div>
                        <p className="text-xs text-gray-500 mb-3">Add this to your Instagram bio or send to clients directly.</p>
                        <div className="flex items-center space-x-2">
                            <div className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-gray-600 font-mono text-sm truncate">
                                {publicLink}
                            </div>
                            <button
                                onClick={() => copyToClipboard(publicLink, setCopiedLink)}
                                className={`p-3 border rounded-lg transition-colors ${copiedLink ? 'bg-green-50 border-green-200 text-green-600' : 'bg-white border-gray-200 hover:bg-gray-50 text-gray-500'}`}
                            >
                                {copiedLink ? <Check size={20} /> : <Copy size={20} />}
                            </button>
                        </div>
                        <a href={publicLink} target="_blank" rel="noopener noreferrer" className="text-xs text-pink-500 hover:underline mt-2 inline-block font-medium">
                            Preview Page &rarr;
                        </a>
                    </div>

                    {/* Iframe Embed */}
                    <div>
                        <div className="flex items-center space-x-2 text-indigo-500 mb-2">
                            <Code size={18} />
                            <label className="block text-sm font-bold text-gray-900">Website Embed (Iframe)</label>
                        </div>
                        <p className="text-xs text-gray-500 mb-3">Best for Wix, Squarespace, or custom websites.</p>
                        <div className="relative">
                            <pre className="bg-gray-50 text-gray-600 rounded-lg p-4 text-xs font-mono overflow-x-auto border border-gray-200">
                                {iframeCode}
                            </pre>
                            <button
                                onClick={() => copyToClipboard(iframeCode, setCopiedEmbed)}
                                className="absolute top-2 right-2 p-2 bg-white border border-gray-200 rounded hover:bg-gray-50 text-gray-500 transition-colors"
                            >
                                {copiedEmbed ? <Check size={16} /> : <Copy size={16} />}
                            </button>
                        </div>
                    </div>

                    {/* Customization */}
                    <div className="pt-6 border-t border-gray-100">
                        <h3 className="font-bold text-gray-900 mb-4">Customization</h3>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Welcome Message</label>
                            <p className="text-xs text-gray-500">This text appears above the upload button on your public page.</p>
                            <textarea
                                value={welcomeMessage}
                                onChange={(e) => setWelcomeMessage(e.target.value)}
                                placeholder="e.g., Upload your inspo pic to get an instant quote!"
                                className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:border-pink-500 min-h-[100px] text-sm"
                            />
                        </div>
                        <div className="flex justify-end mt-4">
                            <button
                                onClick={handleSaveSmartQuote}
                                disabled={isSaving}
                                className={`px-6 py-2 rounded-xl font-medium text-white transition-all ${saveSuccess ? 'bg-green-500' : 'bg-pink-500 hover:bg-pink-600'}`}
                            >
                                {isSaving ? 'Saving...' : saveSuccess ? 'Saved!' : 'Save Changes'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Subscription Section */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                <h3 className="font-bold text-lg mb-4 flex items-center">
                    <CreditCard size={20} className="mr-2 text-pink-500" />
                    Subscription
                </h3>
                {FLAGS.ENABLE_BILLING ? (
                    <>
                        {/* Billing UI Placeholder */}
                    </>
                ) : (
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-pink-100">
                        <div className="flex items-center justify-between mb-2">
                            <p className="font-bold text-charcoal text-lg">Beta Founder Plan</p>
                            <span className="bg-black text-white px-3 py-1 rounded-full text-xs font-bold">
                                Free
                            </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-4">
                            Thank you for being an early adopter! You have full access to all features during the beta period.
                        </p>
                        <div className="text-xs text-gray-400 font-medium uppercase tracking-wider">
                            Next Billing Date: Never
                        </div>
                    </div>
                )}
            </div>

            <button
                onClick={handleLogout}
                className="w-full py-4 text-red-500 font-medium hover:bg-red-50 rounded-xl transition-colors flex items-center justify-center space-x-2"
            >
                <LogOut size={20} />
                <span>Log Out</span>
            </button>
        </div>
    );
}

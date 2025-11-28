import { useState, useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';
import { Copy, Check, Code, ExternalLink, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

export default function SmartQuoteSettings() {
    const { user } = useAppStore();
    const [copiedLink, setCopiedLink] = useState(false);
    const [copiedEmbed, setCopiedEmbed] = useState(false);
    const [welcomeMessage, setWelcomeMessage] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);

    useEffect(() => {
        const fetchSettings = async () => {
            if (user?.id) {
                const docRef = doc(db, 'users', user.id);
                const snapshot = await getDoc(docRef);
                if (snapshot.exists()) {
                    setWelcomeMessage(snapshot.data().smartQuoteSettings?.welcomeMessage || "");
                }
            }
        };
        fetchSettings();
    }, [user]);

    const publicLink = `${window.location.origin}/book/${user?.id}`;
    const embedCode = `<iframe src="${window.location.origin}/embed/${user?.id}" width="100%" height="600" frameborder="0" style="border-radius: 12px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);"></iframe>`;

    const copyLink = () => {
        navigator.clipboard.writeText(publicLink);
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2000);
    };

    const copyEmbed = () => {
        navigator.clipboard.writeText(embedCode);
        setCopiedEmbed(true);
        setTimeout(() => setCopiedEmbed(false), 2000);
    };

    const handleSave = async () => {
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

    return (
        <div className="max-w-2xl mx-auto space-y-8 p-6">
            <div className="flex items-center space-x-4">
                <Link to="/smart-quote" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <ArrowLeft size={20} />
                </Link>
                <h1 className="text-2xl font-bold text-gray-900">Smart Quote Settings</h1>
            </div>

            {/* Public Link Section */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                <div className="flex items-center space-x-2 text-pink-500 mb-2">
                    <ExternalLink size={20} />
                    <h2 className="font-bold text-lg">Your Public Booking Link</h2>
                </div>
                <p className="text-gray-600 text-sm">Share this link with clients or put it in your Instagram bio.</p>

                <div className="flex items-center space-x-2">
                    <input
                        type="text"
                        value={publicLink}
                        readOnly
                        className="flex-1 bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm text-gray-600 focus:outline-none"
                    />
                    <button
                        onClick={copyLink}
                        className={`p-3 rounded-xl font-medium transition-all flex items-center space-x-2 ${copiedLink ? 'bg-green-500 text-white' : 'bg-charcoal text-white hover:bg-black'}`}
                    >
                        {copiedLink ? <Check size={20} /> : <Copy size={20} />}
                    </button>
                </div>
                <a href={publicLink} target="_blank" rel="noopener noreferrer" className="text-sm text-pink-500 hover:underline inline-block">
                    Preview Page &rarr;
                </a>
            </div>

            {/* Embed Code Section */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                <div className="flex items-center space-x-2 text-indigo-500 mb-2">
                    <Code size={20} />
                    <h2 className="font-bold text-lg">Website Embed Widget</h2>
                </div>
                <p className="text-gray-600 text-sm">Copy this code to add the Smart Quote tool to your own website (Wix, Squarespace, etc.).</p>

                <div className="relative">
                    <textarea
                        value={embedCode}
                        readOnly
                        className="w-full h-32 bg-gray-900 text-gray-300 font-mono text-xs p-4 rounded-xl focus:outline-none resize-none"
                    />
                    <button
                        onClick={copyEmbed}
                        className="absolute top-2 right-2 p-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
                    >
                        {copiedEmbed ? <Check size={16} /> : <Copy size={16} />}
                    </button>
                </div>
            </div>

            {/* Customization Section */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                <h2 className="font-bold text-lg text-gray-900">Customization</h2>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Welcome Message</label>
                    <p className="text-xs text-gray-500">This text appears above the upload button on your public page.</p>
                    <textarea
                        value={welcomeMessage}
                        onChange={(e) => setWelcomeMessage(e.target.value)}
                        placeholder="e.g., Upload your inspo pic to get an instant quote!"
                        className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:border-pink-500 min-h-[100px]"
                    />
                </div>

                <div className="flex justify-end">
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className={`px-6 py-2 rounded-xl font-medium text-white transition-all ${saveSuccess ? 'bg-green-500' : 'bg-pink-500 hover:bg-pink-600'}`}
                    >
                        {isSaving ? 'Saving...' : saveSuccess ? 'Saved!' : 'Save Changes'}
                    </button>
                </div>
            </div>
        </div>
    );
}

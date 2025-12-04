import { useState, useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Palette, Layout, Save, Check, Loader2, Smartphone } from 'lucide-react';

interface BookingSettings {
    themeColor: string;
    backgroundType: 'solid' | 'gradient' | 'image';
    backgroundValue: string;
    layout: 'centered' | 'split';
}

const DEFAULT_SETTINGS: BookingSettings = {
    themeColor: '#ec4899',
    backgroundType: 'solid',
    backgroundValue: '#ffffff',
    layout: 'centered'
};

const THEME_COLORS = [
    '#ec4899', // Pink
    '#8b5cf6', // Violet
    '#3b82f6', // Blue
    '#10b981', // Emerald
    '#f59e0b', // Amber
    '#ef4444', // Red
    '#111827', // Charcoal
];

const GRADIENTS = [
    'linear-gradient(to right, #ffecd2 0%, #fcb69f 100%)',
    'linear-gradient(120deg, #a1c4fd 0%, #c2e9fb 100%)',
    'linear-gradient(to top, #cfd9df 0%, #e2ebf0 100%)',
    'linear-gradient(to right, #4facfe 0%, #00f2fe 100%)',
    'linear-gradient(to top, #fbc2eb 0%, #a6c1ee 100%)',
];

export default function BookingPageBuilder() {
    const { user } = useAppStore();
    const [settings, setSettings] = useState<BookingSettings>(DEFAULT_SETTINGS);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const fetchSettings = async () => {
            if (!user?.id) return;
            try {
                const docRef = doc(db, 'users', user.id);
                const snap = await getDoc(docRef);
                if (snap.exists() && snap.data().bookingSettings) {
                    setSettings({ ...DEFAULT_SETTINGS, ...snap.data().bookingSettings });
                }
            } catch (error) {
                console.error("Error fetching booking settings:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchSettings();
    }, [user?.id]);

    const handleSave = async () => {
        if (!user?.id) return;
        setSaving(true);
        try {
            const docRef = doc(db, 'users', user.id);
            await updateDoc(docRef, { bookingSettings: settings });
            // Optional: Toast
        } catch (error) {
            console.error("Error saving booking settings:", error);
            alert("Failed to save settings.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-400">Loading builder...</div>;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Controls */}
            <div className="space-y-8">
                <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 space-y-6">
                    <h3 className="text-xl font-bold text-charcoal flex items-center gap-2">
                        <Palette size={20} className="text-pink-500" />
                        Appearance
                    </h3>

                    {/* Theme Color */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-3">Accent Color</label>
                        <div className="flex flex-wrap gap-3">
                            {THEME_COLORS.map(color => (
                                <button
                                    key={color}
                                    onClick={() => setSettings({ ...settings, themeColor: color })}
                                    className={`w-10 h-10 rounded-full transition-transform hover:scale-110 flex items-center justify-center ${settings.themeColor === color ? 'ring-2 ring-offset-2 ring-gray-300 scale-110' : ''}`}
                                    style={{ backgroundColor: color }}
                                >
                                    {settings.themeColor === color && <Check size={16} className="text-white" />}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Background Style */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-3">Background Style</label>
                        <div className="grid grid-cols-3 gap-3 mb-4">
                            <button
                                onClick={() => setSettings({ ...settings, backgroundType: 'solid', backgroundValue: '#ffffff' })}
                                className={`p-3 rounded-xl border text-sm font-medium transition-all ${settings.backgroundType === 'solid' ? 'border-pink-500 bg-pink-50 text-pink-700' : 'border-gray-200 hover:border-gray-300'}`}
                            >
                                Solid
                            </button>
                            <button
                                onClick={() => setSettings({ ...settings, backgroundType: 'gradient', backgroundValue: GRADIENTS[0] })}
                                className={`p-3 rounded-xl border text-sm font-medium transition-all ${settings.backgroundType === 'gradient' ? 'border-pink-500 bg-pink-50 text-pink-700' : 'border-gray-200 hover:border-gray-300'}`}
                            >
                                Gradient
                            </button>
                            <button
                                onClick={() => setSettings({ ...settings, backgroundType: 'image', backgroundValue: '' })}
                                className={`p-3 rounded-xl border text-sm font-medium transition-all ${settings.backgroundType === 'image' ? 'border-pink-500 bg-pink-50 text-pink-700' : 'border-gray-200 hover:border-gray-300'}`}
                            >
                                Image
                            </button>
                        </div>

                        {settings.backgroundType === 'gradient' && (
                            <div className="grid grid-cols-5 gap-2">
                                {GRADIENTS.map((grad, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setSettings({ ...settings, backgroundValue: grad })}
                                        className={`h-12 rounded-lg transition-all ${settings.backgroundValue === grad ? 'ring-2 ring-offset-2 ring-pink-500' : 'hover:opacity-80'}`}
                                        style={{ background: grad }}
                                    />
                                ))}
                            </div>
                        )}

                        {settings.backgroundType === 'image' && (
                            <div className="space-y-2">
                                <input
                                    type="text"
                                    placeholder="Paste image URL..."
                                    value={settings.backgroundValue}
                                    onChange={(e) => setSettings({ ...settings, backgroundValue: e.target.value })}
                                    className="w-full p-3 border border-gray-200 rounded-xl text-sm focus:border-pink-500 focus:ring-0"
                                />
                                <p className="text-xs text-gray-500">Paste a direct link to an image (Unsplash, etc.)</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 space-y-6">
                    <h3 className="text-xl font-bold text-charcoal flex items-center gap-2">
                        <Layout size={20} className="text-blue-500" />
                        Layout
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                        <button
                            onClick={() => setSettings({ ...settings, layout: 'centered' })}
                            className={`p-4 rounded-xl border-2 transition-all text-left ${settings.layout === 'centered' ? 'border-pink-500 bg-pink-50' : 'border-gray-100 hover:border-gray-200'}`}
                        >
                            <div className="w-full h-20 bg-white border border-gray-200 rounded-lg mb-3 flex items-center justify-center">
                                <div className="w-1/2 h-12 bg-gray-100 rounded-md"></div>
                            </div>
                            <span className="font-bold text-gray-900 block">Centered</span>
                            <span className="text-xs text-gray-500">Classic single column</span>
                        </button>
                        <button
                            onClick={() => setSettings({ ...settings, layout: 'split' })}
                            className={`p-4 rounded-xl border-2 transition-all text-left ${settings.layout === 'split' ? 'border-pink-500 bg-pink-50' : 'border-gray-100 hover:border-gray-200'}`}
                        >
                            <div className="w-full h-20 bg-white border border-gray-200 rounded-lg mb-3 flex">
                                <div className="w-1/2 h-full bg-gray-100 rounded-l-md"></div>
                                <div className="w-1/2 h-full bg-white rounded-r-md"></div>
                            </div>
                            <span className="font-bold text-gray-900 block">Split View</span>
                            <span className="text-xs text-gray-500">Image on left, content on right</span>
                        </button>
                    </div>
                </div>

                <div className="flex justify-end">
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="bg-charcoal text-white px-8 py-4 rounded-xl font-bold hover:bg-black transition-colors flex items-center disabled:opacity-70 shadow-lg shadow-gray-200"
                    >
                        {saving ? <Loader2 className="animate-spin mr-2" /> : <Save size={18} className="mr-2" />}
                        {saving ? 'Saving...' : 'Publish Changes'}
                    </button>
                </div>
            </div>

            {/* Live Preview */}
            <div className="lg:sticky lg:top-8 h-fit max-w-full">
                <div className="bg-gray-900 rounded-[2.5rem] p-4 shadow-2xl border-4 border-gray-800 max-w-full overflow-hidden">
                    <div className="bg-white rounded-[2rem] overflow-hidden h-[600px] relative max-w-full">
                        {/* Mock Browser Bar */}
                        <div className="bg-gray-100 px-4 py-3 flex items-center gap-2 border-b border-gray-200">
                            <div className="flex gap-1.5">
                                <div className="w-2.5 h-2.5 rounded-full bg-red-400"></div>
                                <div className="w-2.5 h-2.5 rounded-full bg-yellow-400"></div>
                                <div className="w-2.5 h-2.5 rounded-full bg-green-400"></div>
                            </div>
                            <div className="flex-1 bg-white rounded-md h-6 mx-2 text-[10px] flex items-center px-2 text-gray-400">
                                lacqr.com/book/you
                            </div>
                        </div>

                        {/* Preview Content */}
                        <div
                            className="h-full overflow-y-auto relative"
                            style={{
                                background: settings.backgroundType === 'image'
                                    ? `url(${settings.backgroundValue}) center/cover no-repeat`
                                    : settings.backgroundValue
                            }}
                        >
                            {/* Overlay for readability if image */}
                            {settings.backgroundType === 'image' && (
                                <div className="absolute inset-0 bg-black/30 pointer-events-none" />
                            )}

                            <div className={`relative z-10 p-6 ${settings.layout === 'centered' ? 'max-w-sm mx-auto pt-12' : 'flex h-full'}`}>
                                {settings.layout === 'centered' ? (
                                    <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/50">
                                        <div className="w-16 h-16 rounded-full bg-gray-200 mx-auto mb-4 border-4 border-white shadow-sm"></div>
                                        <div className="h-4 bg-gray-800 rounded w-3/4 mx-auto mb-2"></div>
                                        <div className="h-3 bg-gray-400 rounded w-1/2 mx-auto mb-6"></div>

                                        <div className="space-y-3">
                                            <div className="h-12 rounded-xl bg-gray-50 border border-gray-100"></div>
                                            <div className="h-12 rounded-xl bg-gray-50 border border-gray-100"></div>
                                            <div
                                                className="h-12 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-lg mt-4"
                                                style={{ backgroundColor: settings.themeColor }}
                                            >
                                                Book Now
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    // Split Layout Mock
                                    <>
                                        <div className="w-1/2 hidden md:block"></div>
                                        <div className="w-full md:w-1/2 bg-white h-full p-6 overflow-y-auto">
                                            <div className="w-12 h-12 rounded-full bg-gray-200 mb-4"></div>
                                            <div className="h-4 bg-gray-800 rounded w-3/4 mb-2"></div>
                                            <div className="h-3 bg-gray-400 rounded w-1/2 mb-6"></div>
                                            <div className="space-y-3">
                                                <div className="h-10 rounded-lg bg-gray-50 border border-gray-100"></div>
                                                <div className="h-10 rounded-lg bg-gray-50 border border-gray-100"></div>
                                                <div
                                                    className="h-10 rounded-lg flex items-center justify-center text-white font-bold text-xs shadow-md mt-4"
                                                    style={{ backgroundColor: settings.themeColor }}
                                                >
                                                    Book Now
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
                <p className="text-center text-gray-400 text-sm mt-4 flex items-center justify-center gap-2">
                    <Smartphone size={16} /> Live Mobile Preview
                </p>
            </div>
        </div>
    );
}

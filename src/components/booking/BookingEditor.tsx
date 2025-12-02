'use client';

import { useState, useEffect } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { Save, Layout, Palette, Type, Globe } from 'lucide-react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';

interface BookingConfig {
    themeColor: string;
    welcomeMessage: string;
    policies: string[];
    showSocialLinks: boolean;
    font?: 'sans' | 'serif' | 'mono';
    buttonStyle?: 'rounded' | 'pill' | 'square';
}

export default function BookingEditor() {
    const { user } = useAppStore();
    const [config, setConfig] = useState<BookingConfig>({
        themeColor: '#ec4899', // Default Pink
        welcomeMessage: "Welcome to my booking page! Please read the policies below before booking.",
        policies: [
            "A non-refundable deposit is required.",
            "Please arrive on time.",
            "No extra guests allowed."
        ],
        showSocialLinks: true,
        font: 'sans',
        buttonStyle: 'rounded'
    });
    const [isSaving, setIsSaving] = useState(false);

    // Load existing config if available
    useEffect(() => {
        if (user?.bookingConfig) {
            setConfig(user.bookingConfig);
        }
    }, [user]);

    const handleSave = async (newConfig?: BookingConfig) => {
        if (!user?.id) return;
        const configToSave = newConfig || config;

        // Update local state if new config passed
        if (newConfig) {
            setConfig(configToSave);
        }

        setIsSaving(true);
        try {
            const userRef = doc(db, 'users', user.id);
            await updateDoc(userRef, {
                bookingConfig: configToSave
            });
            // Optional: Show toast or feedback
        } catch (error) {
            console.error("Error saving booking config:", error);
            alert("Failed to save settings.");
        } finally {
            setIsSaving(false);
        }
    };

    const addPolicy = () => {
        setConfig(prev => ({
            ...prev,
            policies: [...prev.policies, "New Policy"]
        }));
    };

    const updatePolicy = (index: number, value: string) => {
        const newPolicies = [...config.policies];
        newPolicies[index] = value;
        setConfig(prev => ({ ...prev, policies: newPolicies }));
    };

    const removePolicy = (index: number) => {
        const newPolicies = config.policies.filter((_, i) => i !== index);
        setConfig(prev => ({ ...prev, policies: newPolicies }));
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Editor Column */}
            <div className="space-y-6">
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                        <Palette size={20} className="text-pink-500" />
                        Appearance
                    </h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Theme Color</label>
                            <div className="flex gap-3">
                                {['#ec4899', '#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#111827'].map(color => (
                                    <button
                                        key={color}
                                        onClick={() => handleSave({ ...config, themeColor: color })}
                                        className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${config.themeColor === color ? 'border-gray-900 scale-110' : 'border-transparent'}`}
                                        style={{ backgroundColor: color }}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                        <Type size={20} className="text-pink-500" />
                        Typography & Style
                    </h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Font Family</label>
                            <div className="grid grid-cols-3 gap-2">
                                {['sans', 'serif', 'mono'].map((font) => (
                                    <button
                                        key={font}
                                        onClick={() => handleSave({ ...config, font: font as any })}
                                        className={`px-3 py-2 rounded-lg border text-sm capitalize ${config.font === font ? 'border-pink-500 bg-pink-50 text-pink-700 font-bold' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                                    >
                                        {font}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Button Style</label>
                            <div className="grid grid-cols-3 gap-2">
                                {['rounded', 'pill', 'square'].map((style) => (
                                    <button
                                        key={style}
                                        onClick={() => handleSave({ ...config, buttonStyle: style as any })}
                                        className={`px-3 py-2 border text-sm capitalize ${config.buttonStyle === style ? 'border-pink-500 bg-pink-50 text-pink-700 font-bold' : 'border-gray-200 text-gray-600 hover:bg-gray-50'} ${style === 'rounded' ? 'rounded-lg' : style === 'pill' ? 'rounded-full' : 'rounded-none'}`}
                                    >
                                        {style}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Welcome Message</label>
                            <textarea
                                value={config.welcomeMessage}
                                onChange={(e) => setConfig({ ...config, welcomeMessage: e.target.value })}
                                className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:border-pink-500 min-h-[100px]"
                            />
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                        <Layout size={20} className="text-pink-500" />
                        Policies
                    </h3>
                    <div className="space-y-3">
                        {config.policies.map((policy, index) => (
                            <div key={index} className="flex gap-2">
                                <input
                                    type="text"
                                    value={policy}
                                    onChange={(e) => updatePolicy(index, e.target.value)}
                                    className="flex-1 p-2 border border-gray-200 rounded-lg focus:outline-none focus:border-pink-500"
                                />
                                <button
                                    onClick={() => removePolicy(index)}
                                    className="text-red-400 hover:text-red-600 px-2"
                                >
                                    &times;
                                </button>
                            </div>
                        ))}
                        <button
                            onClick={addPolicy}
                            className="text-sm text-pink-500 font-medium hover:text-pink-700"
                        >
                            + Add Policy
                        </button>
                    </div>
                </div>

                <button
                    onClick={() => handleSave()}
                    disabled={isSaving}
                    className="w-full py-4 bg-gray-900 text-white rounded-xl font-bold hover:bg-black transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                    {isSaving ? 'Saving...' : (
                        <>
                            <Save size={20} />
                            Save Changes
                        </>
                    )}
                </button>
            </div>

            {/* Preview Column */}
            <div className="hidden lg:block">
                <div className="sticky top-8">
                    <div className="flex justify-between items-center mb-4 px-4">
                        <h3 className="text-lg font-bold text-gray-500 uppercase tracking-wider text-center">Live Preview</h3>
                        {user?.bookingHandle && (
                            <a
                                href={`/book/${user.bookingHandle}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 text-sm font-bold text-pink-600 hover:text-pink-700 bg-pink-50 px-3 py-1.5 rounded-lg transition-colors"
                            >
                                <Globe size={16} />
                                View Live
                            </a>
                        )}
                    </div>
                    <div className="border-[8px] border-gray-900 rounded-[3rem] overflow-hidden shadow-2xl bg-white h-[800px] relative">
                        {/* Mock Phone Header */}
                        <div className="bg-gray-100 h-6 w-full absolute top-0 left-0 z-10 flex justify-center items-center">
                            <div className="w-20 h-4 bg-gray-300 rounded-full mt-1"></div>
                        </div>

                        {/* Preview Content */}
                        <div className={`h-full overflow-y-auto pb-8 scrollbar-hide ${config.font === 'serif' ? 'font-serif' : config.font === 'mono' ? 'font-mono' : 'font-sans'}`}>
                            {/* Header Image */}
                            <div className="h-32 bg-gray-200 w-full relative">
                                {user?.headerImageUrl && (
                                    <img src={user.headerImageUrl} alt="Header" className="w-full h-full object-cover" />
                                )}
                            </div>

                            <div className="px-4 -mt-12 text-center mb-8 relative z-10">
                                <div className="w-24 h-24 bg-white rounded-full mx-auto mb-4 p-1 shadow-lg">
                                    {user?.logoUrl ? (
                                        <img src={user.logoUrl} alt="Logo" className="w-full h-full rounded-full object-cover bg-gray-200" />
                                    ) : (
                                        <div className="w-full h-full rounded-full bg-gray-200" />
                                    )}
                                </div>
                                <h2 className="text-xl font-bold">{user?.salonName || "Your Salon"}</h2>
                                <p className="text-sm text-gray-500">@{user?.bookingHandle || "username"}</p>
                            </div>

                            <div className="px-4">
                                <div
                                    className="p-6 rounded-2xl text-white mb-6 shadow-lg"
                                    style={{ backgroundColor: user?.brandColor || config.themeColor }}
                                >
                                    <h3 className="font-bold mb-2">Welcome</h3>
                                    <p className="text-sm opacity-90">{config.welcomeMessage}</p>
                                </div>

                                <div className="space-y-4 mb-8">
                                    <h3 className="font-bold text-gray-900">Policies</h3>
                                    <ul className="space-y-2">
                                        {config.policies.map((policy, i) => (
                                            <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                                                <span className="mt-1 w-1.5 h-1.5 rounded-full bg-gray-400 flex-shrink-0" />
                                                {policy}
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div className="border-t border-gray-100 pt-6 text-center">
                                    <button
                                        className={`w-full py-3 font-bold text-white shadow-md ${config.buttonStyle === 'pill' ? 'rounded-full' : config.buttonStyle === 'square' ? 'rounded-none' : 'rounded-xl'}`}
                                        style={{ backgroundColor: user?.brandColor || config.themeColor }}
                                    >
                                        Book Now
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

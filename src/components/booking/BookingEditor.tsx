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
        showSocialLinks: true
    });
    const [isSaving, setIsSaving] = useState(false);

    // Load existing config if available (mock for now, would pull from user profile)
    useEffect(() => {
        if (user?.bookingConfig) {
            setConfig(user.bookingConfig);
        }
    }, [user]);

    const handleSave = async () => {
        if (!user?.id) return;
        setIsSaving(true);
        try {
            const userRef = doc(db, 'users', user.id);
            await updateDoc(userRef, {
                bookingConfig: config
            });
            alert("Booking page settings saved!");
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
                                        onClick={() => setConfig({ ...config, themeColor: color })}
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
                        Content
                    </h3>
                    <div className="space-y-4">
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
                    onClick={handleSave}
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
                    <h3 className="text-lg font-bold mb-4 text-gray-500 uppercase tracking-wider text-center">Live Preview</h3>
                    <div className="border-[8px] border-gray-900 rounded-[3rem] overflow-hidden shadow-2xl bg-white h-[800px] relative">
                        {/* Mock Phone Header */}
                        <div className="bg-gray-100 h-6 w-full absolute top-0 left-0 z-10 flex justify-center items-center">
                            <div className="w-20 h-4 bg-gray-300 rounded-full mt-1"></div>
                        </div>

                        {/* Preview Content */}
                        <div className="h-full overflow-y-auto pt-8 pb-8 px-4 scrollbar-hide">
                            <div className="text-center mb-8">
                                <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-4"></div>
                                <h2 className="text-xl font-bold">{user?.salonName || "Your Salon"}</h2>
                                <p className="text-sm text-gray-500">@{user?.bookingHandle || "username"}</p>
                            </div>

                            <div
                                className="p-6 rounded-2xl text-white mb-6 shadow-lg"
                                style={{ backgroundColor: config.themeColor }}
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
                                    className="w-full py-3 rounded-xl font-bold text-white shadow-md"
                                    style={{ backgroundColor: config.themeColor }}
                                >
                                    Book Now
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

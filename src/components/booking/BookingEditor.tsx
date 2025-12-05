/* eslint-disable @next/next/no-img-element */
'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAppStore } from '../../store/useAppStore';
import { Save, Layout, Palette, Type, Globe } from 'lucide-react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';

import type { BookingConfig } from '@/types/user';

export default function BookingEditor() {
    const { user, setUser } = useAppStore();
    const searchParams = useSearchParams();
    const router = useRouter();
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
        buttonStyle: 'rounded',
        paymentMethods: {
            cash: true,
            zelle: false,
            venmo: false,
            square: false,
            stripe: false
        },
        paymentHandles: {
            zelle: '',
            venmo: '',
            squareUrl: ''
        }
    });
    const [isSaving, setIsSaving] = useState(false);

    // Load existing config if available
    useEffect(() => {
        if (user?.bookingConfig) {
            setConfig(user.bookingConfig);
        }
    }, [user]);

    // Handle Stripe Return
    useEffect(() => {
        const checkStripeStatus = async () => {
            if (searchParams.get('stripe_return') === 'true' && user?.id) {
                // Refresh user data to check if stripeConnected is true
                try {
                    const userRef = doc(db, 'users', user.id);
                    const { getDoc } = await import('firebase/firestore');
                    const snap = await getDoc(userRef);
                    if (snap.exists()) {
                        const userData = snap.data();
                        // Update local store
                        // Note: We need to cast or ensure types match
                        setUser({ ...user, ...userData } as any);

                        // Clean URL
                        router.replace('/dashboard/settings/booking');
                        alert('Stripe account connected successfully!');
                    }
                } catch (error) {
                    console.error("Error refreshing user data:", error);
                }
            }
        };

        checkStripeStatus();
    }, [searchParams, user, router, setUser]);

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

    const handleConnectStripe = async () => {
        if (!user?.id) return;

        try {
            setIsSaving(true);
            const { auth } = await import('../../lib/firebase');
            const token = await auth.currentUser?.getIdToken();

            if (!token) {
                alert("Please sign in again to connect Stripe.");
                return;
            }

            const response = await fetch('/api/stripe/connect', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    email: user.email,
                    name: user.name
                })
            });

            const data = await response.json();

            if (data.url) {
                window.location.href = data.url;
            } else {
                alert('Failed to start Stripe connection: ' + (data.error || 'Unknown error'));
            }
        } catch (error) {
            console.error('Stripe Connect Error:', error);
            alert('Failed to connect to Stripe. Please try again.');
        } finally {
            setIsSaving(false);
        }
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

                {/* Contact Info Section */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                        <Globe size={20} className="text-pink-500" />
                        Contact & Social
                    </h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-700">Show Social Links</span>
                            <button
                                onClick={() => handleSave({ ...config, showSocialLinks: !config.showSocialLinks })}
                                className={`w-12 h-6 rounded-full transition-colors relative ${config.showSocialLinks ? 'bg-pink-500' : 'bg-gray-200'}`}
                            >
                                <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${config.showSocialLinks ? 'left-7' : 'left-1'}`} />
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Public Phone</label>
                                <input
                                    type="tel"
                                    value={config.publicPhone || ''}
                                    onChange={(e) => setConfig({ ...config, publicPhone: e.target.value })}
                                    className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:border-pink-500"
                                    placeholder="Override profile phone"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Public Email</label>
                                <input
                                    type="email"
                                    value={config.publicEmail || ''}
                                    onChange={(e) => setConfig({ ...config, publicEmail: e.target.value })}
                                    className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:border-pink-500"
                                    placeholder="Override profile email"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Instagram</label>
                                <div className="flex items-center">
                                    <span className="bg-gray-50 border border-r-0 border-gray-200 rounded-l-lg px-2 py-2 text-gray-500 text-sm">@</span>
                                    <input
                                        type="text"
                                        value={config.instagramHandle || ''}
                                        onChange={(e) => setConfig({ ...config, instagramHandle: e.target.value })}
                                        className="w-full p-2 border border-gray-200 rounded-r-lg focus:outline-none focus:border-pink-500"
                                        placeholder="username"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">TikTok</label>
                                <div className="flex items-center">
                                    <span className="bg-gray-50 border border-r-0 border-gray-200 rounded-l-lg px-2 py-2 text-gray-500 text-sm">@</span>
                                    <input
                                        type="text"
                                        value={config.tiktokHandle || ''}
                                        onChange={(e) => setConfig({ ...config, tiktokHandle: e.target.value })}
                                        className="w-full p-2 border border-gray-200 rounded-r-lg focus:outline-none focus:border-pink-500"
                                        placeholder="username"
                                    />
                                </div>
                            </div>
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

                {/* Payment Methods Section */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                        <span className="text-pink-500">$</span>
                        Payment Methods
                    </h3>
                    <div className="space-y-4">
                        {/* Cash */}
                        <label className="flex items-center justify-between p-3 bg-gray-50 rounded-xl cursor-pointer">
                            <span className="font-medium text-gray-700">Cash</span>
                            <input
                                type="checkbox"
                                checked={config.paymentMethods?.cash ?? true}
                                onChange={(e) => setConfig({
                                    ...config,
                                    paymentMethods: { ...config.paymentMethods, cash: e.target.checked }
                                })}
                                className="w-5 h-5 text-pink-500 rounded focus:ring-pink-500"
                            />
                        </label>

                        {/* Zelle */}
                        <div className="space-y-2">
                            <label className="flex items-center justify-between p-3 bg-gray-50 rounded-xl cursor-pointer">
                                <span className="font-medium text-gray-700">Zelle</span>
                                <input
                                    type="checkbox"
                                    checked={config.paymentMethods?.zelle ?? false}
                                    onChange={(e) => setConfig({
                                        ...config,
                                        paymentMethods: { ...config.paymentMethods, zelle: e.target.checked }
                                    })}
                                    className="w-5 h-5 text-pink-500 rounded focus:ring-pink-500"
                                />
                            </label>
                            {config.paymentMethods?.zelle && (
                                <input
                                    type="text"
                                    value={config.paymentHandles?.zelle || ''}
                                    onChange={(e) => setConfig({
                                        ...config,
                                        paymentHandles: { ...config.paymentHandles, zelle: e.target.value }
                                    })}
                                    placeholder="Zelle Phone/Email"
                                    className="w-full p-2 border border-gray-200 rounded-lg ml-2 text-sm"
                                />
                            )}
                        </div>

                        {/* Venmo */}
                        <div className="space-y-2">
                            <label className="flex items-center justify-between p-3 bg-gray-50 rounded-xl cursor-pointer">
                                <span className="font-medium text-gray-700">Venmo</span>
                                <input
                                    type="checkbox"
                                    checked={config.paymentMethods?.venmo ?? false}
                                    onChange={(e) => setConfig({
                                        ...config,
                                        paymentMethods: { ...config.paymentMethods, venmo: e.target.checked }
                                    })}
                                    className="w-5 h-5 text-pink-500 rounded focus:ring-pink-500"
                                />
                            </label>
                            {config.paymentMethods?.venmo && (
                                <input
                                    type="text"
                                    value={config.paymentHandles?.venmo || ''}
                                    onChange={(e) => setConfig({
                                        ...config,
                                        paymentHandles: { ...config.paymentHandles, venmo: e.target.value }
                                    })}
                                    placeholder="Venmo Handle (@username)"
                                    className="w-full p-2 border border-gray-200 rounded-lg ml-2 text-sm"
                                />
                            )}
                        </div>

                        {/* Square */}
                        <div className="space-y-2">
                            <label className="flex items-center justify-between p-3 bg-gray-50 rounded-xl cursor-pointer">
                                <span className="font-medium text-gray-700">Square</span>
                                <input
                                    type="checkbox"
                                    checked={config.paymentMethods?.square ?? false}
                                    onChange={(e) => setConfig({
                                        ...config,
                                        paymentMethods: { ...config.paymentMethods, square: e.target.checked }
                                    })}
                                    className="w-5 h-5 text-pink-500 rounded focus:ring-pink-500"
                                />
                            </label>
                            {config.paymentMethods?.square && (
                                <input
                                    type="url"
                                    value={config.paymentHandles?.squareUrl || ''}
                                    onChange={(e) => setConfig({
                                        ...config,
                                        paymentHandles: { ...config.paymentHandles, squareUrl: e.target.value }
                                    })}
                                    placeholder="Square Booking URL"
                                    className="w-full p-2 border border-gray-200 rounded-lg ml-2 text-sm"
                                />
                            )}
                        </div>

                        {/* Stripe (Platform) */}
                        <div className="p-4 bg-pink-50 rounded-xl border border-pink-100">
                            <div className="flex items-center justify-between mb-2">
                                <span className="font-bold text-gray-800">Stripe Connect</span>
                                {user?.stripeConnected ? (
                                    <span className="text-xs bg-green-100 px-2 py-1 rounded border border-green-200 text-green-600 font-medium flex items-center gap-1">
                                        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                        Connected
                                    </span>
                                ) : (
                                    <span className="text-xs bg-white px-2 py-1 rounded border border-pink-200 text-pink-600 font-medium">Platform Payments</span>
                                )}
                            </div>
                            <p className="text-xs text-gray-600 mb-3">
                                Accept credit cards directly through Lacqr. We take a small platform fee (1%) on top of Stripe processing fees.
                            </p>
                            {user?.stripeConnected ? (
                                <button disabled className="w-full py-2 bg-green-50 border border-green-200 text-green-600 rounded-lg text-sm font-medium cursor-default">
                                    Account Connected
                                </button>
                            ) : (
                                <button
                                    onClick={handleConnectStripe}
                                    disabled={isSaving}
                                    className="w-full py-2 bg-white border border-pink-200 text-pink-500 hover:bg-pink-50 hover:border-pink-300 rounded-lg text-sm font-medium transition-all"
                                >
                                    {isSaving ? 'Connecting...' : 'Connect Stripe Account'}
                                </button>
                            )}
                        </div>
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

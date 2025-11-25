import { User, Bell, Shield, CreditCard, LogOut, Copy } from 'lucide-react';
import { FLAGS } from '../config/flags';

export default function Settings() {
    return (
        <div className="max-w-2xl mx-auto space-y-8">
            <div>
                <h2 className="text-3xl font-bold tracking-tight font-serif">Settings</h2>
                <p className="text-gray-500 mt-2">Manage your account preferences and subscription.</p>
            </div>

            {/* Profile Section */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center space-x-4 mb-6">
                    <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center text-pink-600 font-bold text-xl">
                        JD
                    </div>
                    <div>
                        <h3 className="font-bold text-lg">Jane Doe</h3>
                        <p className="text-gray-500 text-sm">jane@example.com</p>
                    </div>
                    <button className="ml-auto text-sm font-medium text-pink-600 hover:text-pink-700">
                        Edit Profile
                    </button>
                </div>

                <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                        <div className="flex items-center space-x-3">
                            <User size={20} className="text-gray-400" />
                            <span className="font-medium">Account Details</span>
                        </div>
                        <span className="text-gray-400">›</span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                        <div className="flex items-center space-x-3">
                            <Shield size={20} className="text-gray-400" />
                            <span className="font-medium">Security & Password</span>
                        </div>
                        <span className="text-gray-400">›</span>
                    </div>
                </div>
            </div>

            {/* Booking Integration Section */}
            <div className="bg-white rounded-3xl shadow-sm border border-pink-100 overflow-hidden">
                <div className="p-6 border-b border-pink-50">
                    <h2 className="text-xl font-serif font-bold text-charcoal">Booking Integration</h2>
                    <p className="text-gray-500 text-sm mt-1">Connect Lacqr with your existing booking flow.</p>
                </div>
                <div className="p-6 space-y-8">
                    {/* Direct Link */}
                    <div>
                        <label className="block text-sm font-bold text-gray-900 mb-2">Your Personal Booking Link</label>
                        <p className="text-xs text-gray-500 mb-3">Add this to your Instagram bio or send to clients directly.</p>
                        <div className="flex items-center space-x-2">
                            <div className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-gray-600 font-mono text-sm">
                                lacqr.com/book/jessica-nails
                            </div>
                            <button className="p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-500 transition-colors">
                                <Copy size={20} />
                            </button>
                        </div>
                    </div>

                    {/* Smart Widget */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="block text-sm font-bold text-gray-900">Smart Widget Code</label>
                            <span className="px-2 py-1 bg-green-100 text-green-700 text-[10px] font-bold uppercase tracking-wide rounded-full">Recommended</span>
                        </div>
                        <p className="text-xs text-gray-500 mb-3">
                            Copy and paste this code into your <strong>Calendly, Acuity, or Square</strong> booking page description or confirmation message.
                        </p>
                        <div className="relative">
                            <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 text-xs font-mono overflow-x-auto border border-gray-800">
                                {`<script src="https://lacqr.com/widget.js" data-user="jessica-nails"></script>`}
                            </pre>
                            <button className="absolute top-2 right-2 p-2 bg-white/10 rounded hover:bg-white/20 text-white transition-colors">
                                <Copy size={16} />
                            </button>
                        </div>
                    </div>

                    {/* Iframe Fallback */}
                    <div>
                        <label className="block text-sm font-bold text-gray-900 mb-2">Website Embed (Iframe)</label>
                        <p className="text-xs text-gray-500 mb-3">Best for Wix, Squarespace, or custom websites.</p>
                        <div className="relative">
                            <pre className="bg-gray-50 text-gray-600 rounded-lg p-4 text-xs font-mono overflow-x-auto border border-gray-200">
                                {`<iframe src="https://lacqr.com/embed/jessica-nails" width="100%" height="600" frameborder="0"></iframe>`}
                            </pre>
                            <button className="absolute top-2 right-2 p-2 bg-white border border-gray-200 rounded hover:bg-gray-50 text-gray-500 transition-colors">
                                <Copy size={16} />
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
                        <div className="bg-pink-50 rounded-xl p-4 flex justify-between items-center mb-4">
                            <div>
                                <p className="font-bold text-pink-900">Pro Plan</p>
                                <p className="text-sm text-pink-700">Active until Dec 18, 2025</p>
                            </div>
                            <span className="bg-white text-pink-600 px-3 py-1 rounded-full text-xs font-bold shadow-sm">
                                Active
                            </span>
                        </div>
                        <button className="text-sm font-medium text-gray-500 hover:text-charcoal">
                            Manage Billing
                        </button>
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

            {/* Preferences */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                <h3 className="font-bold text-lg mb-4 flex items-center">
                    <Bell size={20} className="mr-2 text-gray-400" />
                    Preferences
                </h3>
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <span className="text-gray-600">Email Notifications</span>
                        <div className="w-11 h-6 bg-pink-500 rounded-full relative cursor-pointer">
                            <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm"></div>
                        </div>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-gray-600">Marketing Updates</span>
                        <div className="w-11 h-6 bg-gray-200 rounded-full relative cursor-pointer">
                            <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm"></div>
                        </div>
                    </div>
                </div>
            </div>

            <button className="w-full py-4 text-red-500 font-medium hover:bg-red-50 rounded-xl transition-colors flex items-center justify-center space-x-2">
                <LogOut size={20} />
                <span>Log Out</span>
            </button>
        </div>
    );
}

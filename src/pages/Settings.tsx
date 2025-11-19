import { User, Bell, Shield, CreditCard, LogOut } from 'lucide-react';

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

            {/* Subscription Section */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                <h3 className="font-bold text-lg mb-4 flex items-center">
                    <CreditCard size={20} className="mr-2 text-pink-500" />
                    Subscription
                </h3>
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

'use client';

import { useAppStore } from '@/store/useAppStore';
import { Camera, Sparkles, Users, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import DraftsList from '@/components/DraftsList';

export default function Dashboard() {
    const { user } = useAppStore();

    const quickActions = [
        {
            title: "New Scan",
            desc: "Price a set with AI",
            icon: <Camera size={24} className="text-white" />,
            bg: "bg-pink-500",
            link: "/lacqr-lens"
        },
        {
            title: "Smart Quote",
            desc: "Generate booking text",
            icon: <Sparkles size={24} className="text-white" />,
            bg: "bg-indigo-500",
            link: "/smart-quote"
        },
        {
            title: "CRM",
            desc: "Manage your book",
            icon: <Users size={24} className="text-white" />,
            bg: "bg-purple-500",
            link: "/crm"
        }
    ];

    return (
        <div className="p-8 space-y-8 max-w-5xl mx-auto">
            {/* Welcome Section */}
            <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
                <div className="relative z-10">
                    <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.name?.split(' ')[0] || 'Tech'}! 👋</h1>
                    <p className="text-gray-300 mb-6 max-w-lg">Ready to price some sets? Your AI assistant is standing by.</p>
                    <Link
                        href="/lacqr-lens"
                        className="inline-flex items-center gap-2 bg-white text-gray-900 px-6 py-3 rounded-xl font-bold hover:bg-gray-100 transition-colors"
                    >
                        <Camera size={20} />
                        Start New Scan
                    </Link>
                </div>

                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-pink-500/20 rounded-full blur-3xl -mr-16 -mt-16"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl -ml-10 -mb-10"></div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {quickActions.map((action, idx) => (
                    <Link
                        key={idx}
                        href={action.link}
                        className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all group"
                    >
                        <div className={`${action.bg} w-12 h-12 rounded-xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                            {action.icon}
                        </div>
                        <h3 className="font-bold text-gray-900 text-lg">{action.title}</h3>
                        <p className="text-sm text-gray-500">{action.desc}</p>
                    </Link>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Drafts */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="font-bold text-xl text-gray-900">Recent Drafts</h2>
                        <Link href="/drafts" className="text-sm text-pink-500 font-medium hover:text-pink-600">
                            View All
                        </Link>
                    </div>
                    <DraftsList />
                </div>

                {/* Stats / Info (Placeholder) */}
                <div className="space-y-4">
                    <h2 className="font-bold text-xl text-gray-900">Quick Tips</h2>
                    <div className="bg-indigo-50 p-6 rounded-2xl border border-indigo-100">
                        <div className="flex items-start gap-3">
                            <Sparkles className="text-indigo-500 mt-1 flex-shrink-0" size={20} />
                            <div>
                                <h4 className="font-bold text-indigo-900 text-sm mb-1">Smart Quote</h4>
                                <p className="text-xs text-indigo-700 leading-relaxed">
                                    Did you know you can share your Smart Quote link directly with clients? Check your settings to get your link!
                                </p>
                                <Link href="/settings" className="text-xs font-bold text-indigo-600 mt-3 inline-flex items-center gap-1 hover:text-indigo-800">
                                    Go to Settings <ArrowRight size={12} />
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

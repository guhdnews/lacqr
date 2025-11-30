'use client';

import { CheckCircle, X } from 'lucide-react';
import Link from 'next/link';

export default function Pricing() {
    return (
        <div className="font-sans text-charcoal">
            {/* Header */}
            <section className="bg-pink-50 py-20 px-6 text-center">
                <h1 className="text-4xl md:text-6xl font-serif font-bold mb-6">Simple, Transparent Pricing</h1>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                    Start for free, upgrade when you grow. No hidden fees, no contracts.
                </p>
            </section>

            {/* Pricing Cards */}
            <section className="py-20 px-6">
                <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8 items-start">

                    {/* Free Tier */}
                    <div className="bg-white border border-gray-200 rounded-3xl p-8 md:p-12 hover:shadow-xl transition-all duration-300 relative">
                        <h3 className="text-2xl font-bold mb-2">Starter</h3>
                        <p className="text-gray-500 mb-6">Perfect for trying out the AI magic.</p>
                        <div className="text-5xl font-bold mb-8">$0 <span className="text-lg font-normal text-gray-400">/mo</span></div>

                        <Link
                            href="/signup"
                            className="block w-full text-center border-2 border-charcoal text-charcoal py-4 rounded-xl font-bold hover:bg-gray-50 transition-colors mb-8"
                        >
                            Start for Free
                        </Link>

                        <div className="space-y-4">
                            <p className="font-bold text-sm uppercase tracking-wider text-gray-400">What's Included</p>
                            <ul className="space-y-4">
                                <li className="flex items-center space-x-3">
                                    <CheckCircle size={20} className="text-green-500 flex-shrink-0" />
                                    <span>5 Lacqr Lens Scans per month</span>
                                </li>
                                <li className="flex items-center space-x-3">
                                    <CheckCircle size={20} className="text-green-500 flex-shrink-0" />
                                    <span>Basic Smart Quote generation</span>
                                </li>
                                <li className="flex items-center space-x-3">
                                    <CheckCircle size={20} className="text-green-500 flex-shrink-0" />
                                    <span>Standard Service Menu</span>
                                </li>
                                <li className="flex items-center space-x-3 text-gray-400">
                                    <X size={20} className="flex-shrink-0" />
                                    <span>Custom Price Settings</span>
                                </li>
                                <li className="flex items-center space-x-3 text-gray-400">
                                    <X size={20} className="flex-shrink-0" />
                                    <span>Client CRM</span>
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* Pro Tier */}
                    <div className="bg-charcoal text-white rounded-3xl p-8 md:p-12 shadow-2xl relative transform md:-translate-y-4 border border-gray-800">
                        <div className="absolute top-0 right-0 bg-pink-500 text-white text-xs font-bold px-4 py-2 rounded-bl-2xl">MOST POPULAR</div>
                        <h3 className="text-2xl font-bold mb-2">Pro Boss</h3>
                        <p className="text-gray-400 mb-6">For serious techs ready to scale.</p>
                        <div className="text-5xl font-bold mb-8">$19 <span className="text-lg font-normal text-gray-400">/mo</span></div>

                        <Link
                            href="/signup"
                            className="block w-full text-center bg-white text-charcoal py-4 rounded-xl font-bold hover:bg-gray-100 transition-colors mb-8 shadow-lg"
                        >
                            Get Pro Access
                        </Link>

                        <div className="space-y-4">
                            <p className="font-bold text-sm uppercase tracking-wider text-gray-500">Everything in Starter, plus:</p>
                            <ul className="space-y-4">
                                <li className="flex items-center space-x-3">
                                    <CheckCircle size={20} className="text-pink-400 flex-shrink-0" />
                                    <span><strong>Unlimited</strong> Lacqr Lens Scans</span>
                                </li>
                                <li className="flex items-center space-x-3">
                                    <CheckCircle size={20} className="text-pink-400 flex-shrink-0" />
                                    <span>Advanced Price Customization</span>
                                </li>
                                <li className="flex items-center space-x-3">
                                    <CheckCircle size={20} className="text-pink-400 flex-shrink-0" />
                                    <span>Full Client CRM & History</span>
                                </li>
                                <li className="flex items-center space-x-3">
                                    <CheckCircle size={20} className="text-pink-400 flex-shrink-0" />
                                    <span>Analytics Dashboard</span>
                                </li>
                                <li className="flex items-center space-x-3">
                                    <CheckCircle size={20} className="text-pink-400 flex-shrink-0" />
                                    <span>Priority Support</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ Mini Section */}
            <section className="py-20 px-6 bg-gray-50">
                <div className="max-w-3xl mx-auto text-center">
                    <h2 className="text-3xl font-serif font-bold mb-8">Common Questions</h2>
                    <div className="grid gap-6 text-left">
                        <div className="bg-white p-6 rounded-2xl shadow-sm">
                            <h4 className="font-bold mb-2">Can I cancel anytime?</h4>
                            <p className="text-gray-600">Yes, absolutely. There are no contracts. You can cancel your subscription in your settings at any time.</p>
                        </div>
                        <div className="bg-white p-6 rounded-2xl shadow-sm">
                            <h4 className="font-bold mb-2">Do I need to enter a credit card for the free plan?</h4>
                            <p className="text-gray-600">No! You can sign up for the Starter plan without any payment information.</p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}

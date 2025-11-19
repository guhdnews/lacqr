import { CheckCircle, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function Pricing() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-white font-sans text-charcoal">
            <Header />

            <div className="py-24 px-6 text-center bg-pink-50">
                <h1 className="text-4xl md:text-5xl font-serif font-bold mb-6">Simple, Transparent Pricing</h1>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                    Start for free, upgrade when you scale. No hidden fees, ever.
                </p>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-24">
                <div className="grid md:grid-cols-3 gap-8 items-stretch">
                    {/* Starter Tier */}
                    <div className="border border-gray-200 rounded-3xl p-8 flex flex-col hover:border-pink-200 transition-colors relative group bg-white">
                        <div className="mb-8">
                            <h3 className="text-xl font-bold mb-2">Starter</h3>
                            <div className="text-4xl font-bold">$0 <span className="text-base font-normal text-gray-500">/mo</span></div>
                            <p className="text-gray-500 mt-2 text-sm">Perfect for hobbyists or just starting out.</p>
                        </div>
                        <ul className="space-y-4 mb-8 flex-grow">
                            <li className="flex items-start space-x-3 text-gray-600">
                                <CheckCircle size={18} className="text-green-500 mt-1 flex-shrink-0" />
                                <span>5 QuoteCam Scans / mo</span>
                            </li>
                            <li className="flex items-start space-x-3 text-gray-600">
                                <CheckCircle size={18} className="text-green-500 mt-1 flex-shrink-0" />
                                <span>Basic Service Sorting</span>
                            </li>
                            <li className="flex items-start space-x-3 text-gray-400">
                                <X size={18} className="mt-1 flex-shrink-0" />
                                <span>Custom Price Lists</span>
                            </li>
                            <li className="flex items-start space-x-3 text-gray-400">
                                <X size={18} className="mt-1 flex-shrink-0" />
                                <span>Client Messaging</span>
                            </li>
                        </ul>
                        <button
                            onClick={() => navigate('/signup')}
                            className="w-full border-2 border-charcoal text-charcoal py-3 rounded-xl font-medium hover:bg-gray-50 transition-colors mt-auto"
                        >
                            Start Free
                        </button>
                    </div>

                    {/* Pro Boss Tier */}
                    <div className="bg-charcoal text-white rounded-3xl p-8 flex flex-col relative overflow-hidden transform md:-translate-y-4 shadow-2xl ring-4 ring-pink-500/20">
                        <div className="absolute top-0 right-0 bg-pink-500 text-white text-xs font-bold px-3 py-1 rounded-bl-xl">POPULAR</div>
                        <div className="mb-8">
                            <h3 className="text-xl font-bold mb-2">Pro Boss</h3>
                            <div className="text-4xl font-bold">$19 <span className="text-base font-normal text-gray-400">/mo</span></div>
                            <p className="text-gray-400 mt-2 text-sm">For serious techs building a business.</p>
                        </div>
                        <ul className="space-y-4 mb-8 flex-grow">
                            <li className="flex items-start space-x-3 text-gray-300">
                                <CheckCircle size={18} className="text-pink-400 mt-1 flex-shrink-0" />
                                <span>Unlimited QuoteCam Scans</span>
                            </li>
                            <li className="flex items-start space-x-3 text-gray-300">
                                <CheckCircle size={18} className="text-pink-400 mt-1 flex-shrink-0" />
                                <span>Advanced Price Customization</span>
                            </li>
                            <li className="flex items-start space-x-3 text-gray-300">
                                <CheckCircle size={18} className="text-pink-400 mt-1 flex-shrink-0" />
                                <span>Service Sorter + Booking Links</span>
                            </li>
                            <li className="flex items-start space-x-3 text-gray-300">
                                <CheckCircle size={18} className="text-pink-400 mt-1 flex-shrink-0" />
                                <span>Priority Support</span>
                            </li>
                        </ul>
                        <button
                            onClick={() => navigate('/signup')}
                            className="w-full bg-white text-charcoal py-3 rounded-xl font-medium hover:bg-gray-100 transition-colors mt-auto"
                        >
                            Get Pro
                        </button>
                    </div>

                    {/* Salon/Enterprise Tier */}
                    <div className="border border-gray-200 rounded-3xl p-8 flex flex-col hover:border-pink-200 transition-colors relative group bg-white">
                        <div className="mb-8">
                            <h3 className="text-xl font-bold mb-2">Salon</h3>
                            <div className="text-4xl font-bold">$49 <span className="text-base font-normal text-gray-500">/mo</span></div>
                            <p className="text-gray-500 mt-2 text-sm">For salon owners with multiple techs.</p>
                        </div>
                        <ul className="space-y-4 mb-8 flex-grow">
                            <li className="flex items-start space-x-3 text-gray-600">
                                <CheckCircle size={18} className="text-green-500 mt-1 flex-shrink-0" />
                                <span>Everything in Pro Boss</span>
                            </li>
                            <li className="flex items-start space-x-3 text-gray-600">
                                <CheckCircle size={18} className="text-green-500 mt-1 flex-shrink-0" />
                                <span>Up to 5 Team Members</span>
                            </li>
                            <li className="flex items-start space-x-3 text-gray-600">
                                <CheckCircle size={18} className="text-green-500 mt-1 flex-shrink-0" />
                                <span>Team Performance Analytics</span>
                            </li>
                            <li className="flex items-start space-x-3 text-gray-600">
                                <CheckCircle size={18} className="text-green-500 mt-1 flex-shrink-0" />
                                <span>Dedicated Account Manager</span>
                            </li>
                        </ul>
                        <button
                            onClick={() => navigate('/contact')}
                            className="w-full border-2 border-charcoal text-charcoal py-3 rounded-xl font-medium hover:bg-gray-50 transition-colors mt-auto"
                        >
                            Contact Sales
                        </button>
                    </div>
                </div>

                {/* FAQ Snippet */}
                <div className="mt-32 max-w-3xl mx-auto">
                    <h2 className="text-3xl font-serif font-bold mb-12 text-center">Common Questions</h2>
                    <div className="space-y-6">
                        <div className="bg-gray-50 p-6 rounded-2xl">
                            <h4 className="font-bold text-lg mb-2">Can I change plans anytime?</h4>
                            <p className="text-gray-600">Yes, you can upgrade, downgrade, or cancel your subscription at any time from your dashboard.</p>
                        </div>
                        <div className="bg-gray-50 p-6 rounded-2xl">
                            <h4 className="font-bold text-lg mb-2">Do you take a commission on bookings?</h4>
                            <p className="text-gray-600">Never. We are a software provider, not a booking agency. You keep 100% of your earnings.</p>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
}

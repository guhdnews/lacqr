import { CheckCircle } from 'lucide-react';
import Footer from '../components/Footer';

export default function Pricing() {
    return (
        <div className="min-h-screen bg-white font-sans text-charcoal">
            <div className="max-w-7xl mx-auto px-6 py-24 text-center">
                <h1 className="text-5xl font-serif font-bold mb-6">Simple, Transparent Pricing</h1>
                <p className="text-xl text-gray-600 mb-16 max-w-2xl mx-auto">Start for free, upgrade when you scale. No hidden fees.</p>

                <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto text-left">
                    {/* Free Tier */}
                    <div className="border border-gray-200 rounded-3xl p-10 hover:border-pink-200 transition-colors">
                        <h3 className="text-2xl font-bold mb-2">Starter</h3>
                        <div className="text-5xl font-bold mb-8">$0 <span className="text-lg font-normal text-gray-500">/mo</span></div>
                        <ul className="space-y-4 mb-10">
                            <li className="flex items-center space-x-3 text-gray-600">
                                <CheckCircle size={20} className="text-green-500" />
                                <span>5 QuoteCam Scans / mo</span>
                            </li>
                            <li className="flex items-center space-x-3 text-gray-600">
                                <CheckCircle size={20} className="text-green-500" />
                                <span>Basic Service Sorting</span>
                            </li>
                            <li className="flex items-center space-x-3 text-gray-600">
                                <CheckCircle size={20} className="text-green-500" />
                                <span>Standard Support</span>
                            </li>
                        </ul>
                        <button className="w-full border-2 border-charcoal text-charcoal py-4 rounded-xl font-bold hover:bg-gray-50 transition-colors">
                            Start Free
                        </button>
                    </div>

                    {/* Pro Tier */}
                    <div className="bg-charcoal text-white rounded-3xl p-10 relative overflow-hidden shadow-2xl transform md:-translate-y-4">
                        <div className="absolute top-0 right-0 bg-pink-500 text-white text-sm font-bold px-4 py-2 rounded-bl-2xl">POPULAR</div>
                        <h3 className="text-2xl font-bold mb-2">Pro Boss</h3>
                        <div className="text-5xl font-bold mb-8">$19 <span className="text-lg font-normal text-gray-400">/mo</span></div>
                        <ul className="space-y-4 mb-10">
                            <li className="flex items-center space-x-3 text-gray-300">
                                <CheckCircle size={20} className="text-pink-400" />
                                <span>Unlimited QuoteCam Scans</span>
                            </li>
                            <li className="flex items-center space-x-3 text-gray-300">
                                <CheckCircle size={20} className="text-pink-400" />
                                <span>Advanced Price Customization</span>
                            </li>
                            <li className="flex items-center space-x-3 text-gray-300">
                                <CheckCircle size={20} className="text-pink-400" />
                                <span>Priority Support</span>
                            </li>
                            <li className="flex items-center space-x-3 text-gray-300">
                                <CheckCircle size={20} className="text-pink-400" />
                                <span>Client History & Analytics</span>
                            </li>
                        </ul>
                        <button className="w-full bg-white text-charcoal py-4 rounded-xl font-bold hover:bg-gray-100 transition-colors">
                            Get Pro
                        </button>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
}

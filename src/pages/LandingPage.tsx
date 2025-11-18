import { useNavigate } from 'react-router-dom';
import { Camera, Sparkles, CheckCircle, ArrowRight } from 'lucide-react';

export default function LandingPage() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-white font-sans text-charcoal">
            {/* Navigation */}
            <nav className="flex justify-between items-center p-6 max-w-7xl mx-auto">
                <div className="text-xl font-bold tracking-tighter">Lacqr</div>
                <button
                    onClick={() => navigate('/app/quote')}
                    className="text-sm font-medium hover:text-pink-500 transition-colors"
                >
                    Log In
                </button>
            </nav>

            {/* Hero Section */}
            <section className="flex flex-col items-center text-center px-6 py-20 md:py-32 max-w-4xl mx-auto space-y-8">
                <div className="inline-flex items-center space-x-2 bg-pink-50 px-4 py-2 rounded-full text-pink-600 text-sm font-medium animate-fade-in-up">
                    <Sparkles size={16} />
                    <span>The AI Secret Weapon for Nail Techs</span>
                </div>

                <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-tight">
                    Stop Guessing Your Prices. <br />
                    <span className="text-pink-500">Start Getting Paid.</span>
                </h1>

                <p className="text-lg md:text-xl text-gray-600 max-w-2xl leading-relaxed">
                    The aesthetic AI co-pilot that handles your pricing, booking confusion, and client communications. So you can focus on the art.
                </p>

                <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4 pt-4">
                    <button
                        onClick={() => navigate('/app/quote')}
                        className="bg-charcoal text-white px-8 py-4 rounded-full font-medium text-lg hover:bg-black transition-all transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center space-x-2"
                    >
                        <span>Try QuoteCam Free</span>
                        <ArrowRight size={20} />
                    </button>
                    <button className="text-gray-500 hover:text-charcoal font-medium px-6 py-4">
                        Watch Demo
                    </button>
                </div>
            </section>

            {/* Features Section */}
            <section className="bg-pink-50 py-24 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="grid md:grid-cols-3 gap-12">
                        {/* Feature 1 */}
                        <div className="bg-white p-8 rounded-3xl shadow-sm hover:shadow-md transition-shadow">
                            <div className="w-12 h-12 bg-pink-100 rounded-2xl flex items-center justify-center mb-6 text-pink-600">
                                <Camera size={24} />
                            </div>
                            <h3 className="text-2xl font-bold mb-3">QuoteCam™</h3>
                            <p className="text-gray-600 leading-relaxed">
                                Upload a photo of any design. Our AI identifies every cost driver—from chrome to 3D charms—and generates an instant, itemized price receipt.
                            </p>
                        </div>

                        {/* Feature 2 */}
                        <div className="bg-white p-8 rounded-3xl shadow-sm hover:shadow-md transition-shadow">
                            <div className="w-12 h-12 bg-pink-100 rounded-2xl flex items-center justify-center mb-6 text-pink-600">
                                <Sparkles size={24} />
                            </div>
                            <h3 className="text-2xl font-bold mb-3">Service Sorter</h3>
                            <p className="text-gray-600 leading-relaxed">
                                Client sent a vague inspo pic? We analyze it and tell them exactly what to book. "Book Gel-X + Level 2 Art." No more DM back-and-forth.
                            </p>
                        </div>

                        {/* Feature 3 */}
                        <div className="bg-white p-8 rounded-3xl shadow-sm hover:shadow-md transition-shadow">
                            <div className="w-12 h-12 bg-pink-100 rounded-2xl flex items-center justify-center mb-6 text-pink-600">
                                <CheckCircle size={24} />
                            </div>
                            <h3 className="text-2xl font-bold mb-3">Client Shield</h3>
                            <p className="text-gray-600 leading-relaxed">
                                Professionalize your policies. We turn your raw frustration into firm, polite, policy-based responses that protect your boundaries.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Pricing Section */}
            <section className="py-24 px-6 max-w-7xl mx-auto text-center">
                <h2 className="text-4xl font-bold mb-4">Simple, Transparent Pricing</h2>
                <p className="text-gray-600 mb-12">Pay for itself with one saved appointment.</p>

                <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                    {/* Free Tier */}
                    <div className="border border-gray-200 rounded-3xl p-8 text-left hover:border-pink-200 transition-colors">
                        <h3 className="text-xl font-bold mb-2">Starter</h3>
                        <div className="text-4xl font-bold mb-6">$0 <span className="text-base font-normal text-gray-500">/mo</span></div>
                        <ul className="space-y-4 mb-8">
                            <li className="flex items-center space-x-3 text-gray-600">
                                <CheckCircle size={18} className="text-green-500" />
                                <span>5 QuoteCam Scans / mo</span>
                            </li>
                            <li className="flex items-center space-x-3 text-gray-600">
                                <CheckCircle size={18} className="text-green-500" />
                                <span>Basic Service Sorting</span>
                            </li>
                        </ul>
                        <button className="w-full border-2 border-charcoal text-charcoal py-3 rounded-xl font-medium hover:bg-gray-50 transition-colors">
                            Start Free
                        </button>
                    </div>

                    {/* Pro Tier */}
                    <div className="bg-charcoal text-white rounded-3xl p-8 text-left relative overflow-hidden">
                        <div className="absolute top-0 right-0 bg-pink-500 text-white text-xs font-bold px-3 py-1 rounded-bl-xl">POPULAR</div>
                        <h3 className="text-xl font-bold mb-2">Pro Boss</h3>
                        <div className="text-4xl font-bold mb-6">$19 <span className="text-base font-normal text-gray-400">/mo</span></div>
                        <ul className="space-y-4 mb-8">
                            <li className="flex items-center space-x-3 text-gray-300">
                                <CheckCircle size={18} className="text-pink-400" />
                                <span>Unlimited QuoteCam Scans</span>
                            </li>
                            <li className="flex items-center space-x-3 text-gray-300">
                                <CheckCircle size={18} className="text-pink-400" />
                                <span>Advanced Price Customization</span>
                            </li>
                            <li className="flex items-center space-x-3 text-gray-300">
                                <CheckCircle size={18} className="text-pink-400" />
                                <span>Priority Support</span>
                            </li>
                        </ul>
                        <button className="w-full bg-white text-charcoal py-3 rounded-xl font-medium hover:bg-gray-100 transition-colors">
                            Get Pro
                        </button>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-50 py-12 text-center text-gray-400 text-sm">
                <p>© 2024 Lacqr. All rights reserved.</p>
            </footer>
        </div>
    );
}

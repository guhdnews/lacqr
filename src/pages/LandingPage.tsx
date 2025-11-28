import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Sparkles, CheckCircle, ArrowRight, DollarSign, Users, BarChart3, Image as ImageIcon } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';

export default function LandingPage() {
    const navigate = useNavigate();
    const { user } = useAppStore();

    useEffect(() => {
        if (user.isAuthenticated) {
            navigate('/lacqr-lens');
        }
    }, [user.isAuthenticated, navigate]);

    return (
        <div className="font-sans text-charcoal">

            {/* Hero Section */}
            <section className="relative pt-4 pb-12 md:pt-8 md:pb-20 px-6 overflow-hidden">
                <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
                    <div className="space-y-8 text-center md:text-left">
                        <div className="inline-flex items-center space-x-2 bg-pink-50 px-4 py-2 rounded-full text-pink-600 text-sm font-medium animate-fade-in-up border border-pink-100">
                            <Sparkles size={16} />
                            <span>The AI Secret Weapon for Nail Techs</span>
                        </div>

                        <h1 className="text-5xl md:text-7xl font-serif font-bold tracking-tight leading-[1.1]">
                            Stop Guessing. <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-pink-600">Start Scaling.</span>
                        </h1>

                        <p className="text-lg text-gray-600 max-w-xl leading-relaxed mx-auto md:mx-0">
                            The aesthetic AI co-pilot that handles your pricing, booking confusion, and client communications. You focus on the art, we'll handle the business.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4 pt-2 justify-center md:justify-start">
                            <button
                                onClick={() => navigate('/signup')}
                                className="bg-charcoal text-white px-8 py-4 rounded-full font-medium text-lg hover:bg-black transition-all transform hover:scale-105 shadow-xl hover:shadow-2xl flex items-center space-x-2 w-full sm:w-auto justify-center"
                            >
                                <span>Try Lacqr Lens Free</span>
                                <ArrowRight size={20} />
                            </button>
                            <button className="text-gray-500 hover:text-charcoal font-medium px-6 py-4 w-full sm:w-auto">
                                Watch Demo
                            </button>
                        </div>
                    </div>

                    {/* Hero Image Placeholder */}
                    <div className="relative hidden md:block">
                        <div className="absolute inset-0 bg-pink-200 rounded-[3rem] transform rotate-3 opacity-30 blur-3xl"></div>
                        <div className="relative bg-white rounded-[2.5rem] shadow-2xl border border-gray-100 p-4 transform -rotate-2 hover:rotate-0 transition-transform duration-500">
                            <div className="aspect-[4/5] bg-gray-50 rounded-[2rem] overflow-hidden flex items-center justify-center">
                                <img
                                    src="/assets/hero_image_salon.png"
                                    alt="Minimalist Luxury Salon"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* How it Works Section */}
            <section id="how-it-works" className="py-24 px-6 bg-white/50">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">Your New Workflow</h2>
                        <p className="text-gray-600">Three steps to a more profitable business.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-12">
                        {[
                            { icon: Camera, title: "Snap", desc: "Upload a photo of the inspo pic or finished set." },
                            { icon: Sparkles, title: "Scan", desc: "Our AI identifies every cost driver (chrome, gems, length)." },
                            { icon: DollarSign, title: "Send", desc: "Get an instant price quote and booking text to send." }
                        ].map((step, i) => (
                            <div key={i} className="flex flex-col items-center text-center group">
                                <div className="w-20 h-20 bg-pink-50 rounded-full flex items-center justify-center text-pink-500 mb-6 group-hover:scale-110 transition-transform duration-300">
                                    <step.icon size={32} />
                                </div>
                                <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                                <p className="text-gray-600 max-w-xs">{step.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="bg-pink-50 py-24 px-6 rounded-t-[3rem]">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">Tools Built for Techs</h2>
                        <p className="text-gray-600">Everything you need, nothing you don't.</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                        {/* Feature 1 */}
                        <div className="bg-white p-10 rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 border border-white hover:border-pink-100">
                            <div className="w-14 h-14 bg-pink-100 rounded-2xl flex items-center justify-center mb-8 text-pink-600">
                                <Camera size={28} />
                            </div>
                            <h3 className="text-2xl font-bold mb-4">Lacqr Lens</h3>
                            <p className="text-gray-600 leading-relaxed mb-6">
                                Never undercharge again. Upload a photo of any design. Our AI identifies every cost driver—from chrome to 3D charms—and generates an instant, itemized price receipt based on <strong>your</strong> settings.
                            </p>
                            <ul className="space-y-3 text-sm text-gray-500">
                                <li className="flex items-center"><CheckCircle size={16} className="text-pink-500 mr-2" /> Detects length & shape</li>
                                <li className="flex items-center"><CheckCircle size={16} className="text-pink-500 mr-2" /> Counts gems & charms</li>
                                <li className="flex items-center"><CheckCircle size={16} className="text-pink-500 mr-2" /> Suggests time estimates</li>
                            </ul>
                        </div>

                        {/* Feature 2 */}
                        <div className="bg-white p-10 rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 border border-white hover:border-pink-100">
                            <div className="w-14 h-14 bg-pink-100 rounded-2xl flex items-center justify-center mb-8 text-pink-600">
                                <Sparkles size={28} />
                            </div>
                            <h3 className="text-2xl font-bold mb-4">Smart Quote</h3>
                            <p className="text-gray-600 leading-relaxed mb-6">
                                Client sent a vague inspo pic? We analyze it and tell them exactly what to book. "Book Gel-X + Level 2 Art." No more DM back-and-forth or surprise add-ons at the appointment.
                            </p>
                            <ul className="space-y-3 text-sm text-gray-500">
                                <li className="flex items-center"><CheckCircle size={16} className="text-pink-500 mr-2" /> Maps to your booking site</li>
                                <li className="flex items-center"><CheckCircle size={16} className="text-pink-500 mr-2" /> Pre-writes client replies</li>
                                <li className="flex items-center"><CheckCircle size={16} className="text-pink-500 mr-2" /> Reduces booking errors</li>
                            </ul>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mt-8">
                        {/* Feature 3 - CRM */}
                        <div className="bg-white p-8 rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 border border-white hover:border-pink-100">
                            <div className="w-12 h-12 bg-pink-100 rounded-2xl flex items-center justify-center mb-6 text-pink-600">
                                <Users size={24} />
                            </div>
                            <h3 className="text-xl font-bold mb-3">Client CRM</h3>
                            <p className="text-gray-600 text-sm leading-relaxed mb-4">
                                Keep track of every client's history, preferences, and past sets. Never forget a birthday or a favorite color again.
                            </p>
                        </div>

                        {/* Feature 4 - Analytics */}
                        <div className="bg-white p-8 rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 border border-white hover:border-pink-100">
                            <div className="w-12 h-12 bg-pink-100 rounded-2xl flex items-center justify-center mb-6 text-pink-600">
                                <BarChart3 size={24} />
                            </div>
                            <h3 className="text-xl font-bold mb-3">Business Analytics</h3>
                            <p className="text-gray-600 text-sm leading-relaxed mb-4">
                                See exactly how much you're earning. Track your most popular services and identify where you can increase your rates.
                            </p>
                        </div>

                        {/* Feature 5 - Portfolio */}
                        <div className="bg-white p-8 rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 border border-white hover:border-pink-100">
                            <div className="w-12 h-12 bg-pink-100 rounded-2xl flex items-center justify-center mb-6 text-pink-600">
                                <ImageIcon size={24} />
                            </div>
                            <h3 className="text-xl font-bold mb-3">Smart Portfolio</h3>
                            <p className="text-gray-600 text-sm leading-relaxed mb-4">
                                Automatically organize your work by style and price. Show clients exactly what they can get for their budget.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Pricing Section */}
            <section id="pricing" className="py-24 px-6 max-w-7xl mx-auto text-center">
                <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">Simple, Transparent Pricing</h2>
                <p className="text-gray-600 mb-12">Pay for itself with one saved appointment.</p>

                <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                    {/* Free Tier */}
                    <div className="border border-gray-200 rounded-3xl p-8 text-left hover:border-pink-200 transition-colors relative group bg-white">
                        <h3 className="text-xl font-bold mb-2">Starter</h3>
                        <div className="text-4xl font-bold mb-6">$0 <span className="text-base font-normal text-gray-500">/mo</span></div>
                        <ul className="space-y-4 mb-8">
                            <li className="flex items-center space-x-3 text-gray-600">
                                <CheckCircle size={18} className="text-green-500" />
                                <span>5 Lacqr Lens Scans / mo</span>
                            </li>
                            <li className="flex items-center space-x-3 text-gray-600">
                                <CheckCircle size={18} className="text-green-500" />
                                <span>Basic Smart Quote</span>
                            </li>
                        </ul>
                        <button
                            onClick={() => navigate('/signup')}
                            className="w-full border-2 border-charcoal text-charcoal py-3 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                        >
                            Start Free
                        </button>
                    </div>

                    {/* Pro Tier */}
                    <div className="bg-charcoal text-white rounded-3xl p-8 text-left relative overflow-hidden transform md:-translate-y-4 shadow-2xl">
                        <div className="absolute top-0 right-0 bg-pink-500 text-white text-xs font-bold px-3 py-1 rounded-bl-xl">POPULAR</div>
                        <h3 className="text-xl font-bold mb-2">Pro Boss</h3>
                        <div className="text-4xl font-bold mb-6">$19 <span className="text-base font-normal text-gray-400">/mo</span></div>
                        <ul className="space-y-4 mb-8">
                            <li className="flex items-center space-x-3 text-gray-300">
                                <CheckCircle size={18} className="text-pink-400" />
                                <span>Unlimited Lacqr Lens Scans</span>
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
                        <button
                            onClick={() => navigate('/signup')}
                            className="w-full bg-white text-charcoal py-3 rounded-xl font-medium hover:bg-gray-100 transition-colors"
                        >
                            Get Pro
                        </button>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section id="faq" className="py-24 px-6 bg-gray-50">
                <div className="max-w-3xl mx-auto">
                    <h2 className="text-3xl md:text-4xl font-serif font-bold mb-12 text-center">Frequently Asked Questions</h2>
                    <div className="space-y-6">
                        {[
                            { q: "How accurate is the pricing AI?", a: "Our AI is trained on thousands of nail designs. It's highly accurate at identifying components, but you always have the final say to adjust the price before sending it." },
                            { q: "Can I use my own price list?", a: "Yes! In the Pro plan, you can upload your specific service menu prices so the AI quotes match your salon's rates exactly." },
                            { q: "Does it work for all nail shapes?", a: "Absolutely. QuoteCam recognizes all standard shapes (Almond, Coffin, Square, Stiletto) and lengths." },
                            { q: "Is there a free trial?", a: "Yes, the Starter plan is free forever for up to 5 scans per month. You can upgrade to Pro anytime." },
                            { q: "Can I cancel my subscription?", a: "Yes, you can cancel your Pro subscription at any time. You'll keep access until the end of your billing cycle." },
                            { q: "Do I need to download an app?", a: "Lacqr is a web app, meaning you can use it directly in your browser on your phone, tablet, or computer. No download required." }
                        ].map((item, i) => (
                            <div key={i} className="bg-white p-6 rounded-2xl shadow-sm">
                                <h4 className="font-bold text-lg mb-2">{item.q}</h4>
                                <p className="text-gray-600">{item.a}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}

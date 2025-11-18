import { useNavigate } from 'react-router-dom';
import { Camera, Sparkles, CheckCircle, ArrowRight, DollarSign } from 'lucide-react';
import Footer from '../components/Footer';

export default function LandingPage() {
    const navigate = useNavigate();

    const scrollToSection = (id: string) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <div className="min-h-screen bg-white font-sans text-charcoal">
            {/* Sticky Navigation */}
            <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-pink-50">
                <div className="flex justify-between items-center px-6 py-4 max-w-7xl mx-auto">
                    <div className="text-2xl font-serif font-bold tracking-tight text-charcoal cursor-pointer" onClick={() => window.scrollTo(0, 0)}>
                        Lacqr
                    </div>

                    <div className="hidden md:flex items-center space-x-8 text-sm font-medium text-gray-600">
                        <button onClick={() => scrollToSection('how-it-works')} className="hover:text-pink-500 transition-colors">How it Works</button>
                        <button onClick={() => scrollToSection('features')} className="hover:text-pink-500 transition-colors">Features</button>
                        <button onClick={() => scrollToSection('pricing')} className="hover:text-pink-500 transition-colors">Pricing</button>
                        <button onClick={() => scrollToSection('faq')} className="hover:text-pink-500 transition-colors">FAQ</button>
                    </div>

                    <div className="flex items-center space-x-4">
                        <button
                            onClick={() => navigate('/app/quote')}
                            className="text-sm font-medium hover:text-pink-500 transition-colors hidden sm:block"
                        >
                            Log In
                        </button>
                        <button
                            onClick={() => navigate('/app/quote')}
                            className="bg-charcoal text-white px-5 py-2.5 rounded-full text-sm font-medium hover:bg-black transition-all shadow-md hover:shadow-lg"
                        >
                            Get Started
                        </button>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative pt-20 pb-32 px-6 overflow-hidden">
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
                                onClick={() => navigate('/app/quote')}
                                className="bg-charcoal text-white px-8 py-4 rounded-full font-medium text-lg hover:bg-black transition-all transform hover:scale-105 shadow-xl hover:shadow-2xl flex items-center space-x-2 w-full sm:w-auto justify-center"
                            >
                                <span>Try QuoteCam Free</span>
                                <ArrowRight size={20} />
                            </button>
                            <button className="text-gray-500 hover:text-charcoal font-medium px-6 py-4 w-full sm:w-auto">
                                Watch Demo
                            </button>
                        </div>

                        <div className="pt-8 flex items-center justify-center md:justify-start space-x-4 text-sm text-gray-400">
                            <div className="flex -space-x-2">
                                {[1, 2, 3, 4].map(i => (
                                    <div key={i} className="w-8 h-8 rounded-full bg-gray-200 border-2 border-white"></div>
                                ))}
                            </div>
                            <p>Trusted by 500+ Nail Techs</p>
                        </div>
                    </div>

                    {/* Hero Image Placeholder */}
                    <div className="relative hidden md:block">
                        <div className="absolute inset-0 bg-pink-200 rounded-[3rem] transform rotate-3 opacity-30 blur-3xl"></div>
                        <div className="relative bg-white rounded-[2.5rem] shadow-2xl border border-gray-100 p-4 transform -rotate-2 hover:rotate-0 transition-transform duration-500">
                            <div className="aspect-[4/5] bg-gray-50 rounded-[2rem] overflow-hidden flex items-center justify-center">
                                <p className="text-gray-400 font-serif italic">App Screenshot / Aesthetic Image</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* How it Works Section */}
            <section id="how-it-works" className="py-24 px-6 bg-white">
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
                            <h3 className="text-2xl font-bold mb-4">QuoteCam™</h3>
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
                            <h3 className="text-2xl font-bold mb-4">Service Sorter</h3>
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
                </div>
            </section>

            {/* Pricing Section */}
            <section id="pricing" className="py-24 px-6 max-w-7xl mx-auto text-center">
                <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">Simple, Transparent Pricing</h2>
                <p className="text-gray-600 mb-12">Pay for itself with one saved appointment.</p>

                <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                    {/* Free Tier */}
                    <div className="border border-gray-200 rounded-3xl p-8 text-left hover:border-pink-200 transition-colors relative group">
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
                    <div className="bg-charcoal text-white rounded-3xl p-8 text-left relative overflow-hidden transform md:-translate-y-4 shadow-2xl">
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

            {/* FAQ Section */}
            <section id="faq" className="py-24 px-6 bg-gray-50">
                <div className="max-w-3xl mx-auto">
                    <h2 className="text-3xl md:text-4xl font-serif font-bold mb-12 text-center">Frequently Asked Questions</h2>
                    <div className="space-y-6">
                        {[
                            { q: "How accurate is the pricing AI?", a: "Our AI is trained on thousands of nail designs. It's highly accurate at identifying components, but you always have the final say to adjust the price before sending it." },
                            { q: "Can I use my own price list?", a: "Yes! In the Pro plan, you can upload your specific service menu prices so the AI quotes match your salon's rates exactly." },
                            { q: "Does it work for all nail shapes?", a: "Absolutely. QuoteCam recognizes all standard shapes (Almond, Coffin, Square, Stiletto) and lengths." }
                        ].map((item, i) => (
                            <div key={i} className="bg-white p-6 rounded-2xl shadow-sm">
                                <h4 className="font-bold text-lg mb-2">{item.q}</h4>
                                <p className="text-gray-600">{item.a}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
}

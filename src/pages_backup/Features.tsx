import { Camera, Sparkles, Users, BarChart3, Image as ImageIcon, Zap, Clock, Shield, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Features() {
    const navigate = useNavigate();

    return (
        <div className="font-sans text-charcoal">
            {/* Hero */}
            <section className="bg-pink-50 py-20 px-6">
                <div className="max-w-4xl mx-auto text-center">
                    <h1 className="text-4xl md:text-6xl font-serif font-bold mb-6">
                        Everything You Need to Run a <span className="text-pink-600">Modern Salon</span>
                    </h1>
                    <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                        Lacqr isn't just a booking app. It's an AI-powered business partner that handles pricing, scheduling, and client management so you can focus on creating art.
                    </p>
                    <button
                        onClick={() => navigate('/signup')}
                        className="bg-charcoal text-white px-8 py-4 rounded-full font-medium text-lg hover:bg-black transition-all shadow-xl hover:scale-105"
                    >
                        Start Your Free Trial
                    </button>
                </div>
            </section>

            {/* Feature 1: Lacqr Lens */}
            <section className="py-24 px-6">
                <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center">
                    <div className="order-2 md:order-1">
                        <div className="bg-gray-100 rounded-[3rem] p-8 transform -rotate-2 hover:rotate-0 transition-transform duration-500">
                            <img src="/assets/hero_image_salon.png" alt="Lacqr Lens Demo" className="rounded-2xl shadow-lg w-full" />
                        </div>
                    </div>
                    <div className="order-1 md:order-2 space-y-6">
                        <div className="w-16 h-16 bg-pink-100 rounded-2xl flex items-center justify-center text-pink-600">
                            <Camera size={32} />
                        </div>
                        <h2 className="text-3xl md:text-4xl font-serif font-bold">Lacqr Lens AI</h2>
                        <p className="text-lg text-gray-600 leading-relaxed">
                            Stop guessing prices. Upload any inspiration photo or finished set, and our AI instantly analyzes it to identify every cost driver—length, shape, chrome, gems, and 3D art.
                        </p>
                        <ul className="space-y-4">
                            {[
                                "Detects complex art like 3D charms and airbrush",
                                "Calculates price based on YOUR custom settings",
                                "Generates a professional, itemized receipt",
                                "Saves hours of DMing back and forth"
                            ].map((item, i) => (
                                <li key={i} className="flex items-center space-x-3 text-gray-700">
                                    <div className="bg-green-100 p-1 rounded-full text-green-600"><Zap size={14} /></div>
                                    <span>{item}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </section>

            {/* Feature 2: Smart Quote */}
            <section className="py-24 px-6 bg-white">
                <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center">
                    <div className="space-y-6">
                        <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center text-purple-600">
                            <Sparkles size={32} />
                        </div>
                        <h2 className="text-3xl md:text-4xl font-serif font-bold">Smart Quote System</h2>
                        <p className="text-lg text-gray-600 leading-relaxed">
                            Turn vague DMs into confirmed appointments. When a client sends an inspo pic, Smart Quote tells them exactly what services to book on your site to match that look.
                        </p>
                        <ul className="space-y-4">
                            {[
                                "Eliminates 'What do I book for this?' questions",
                                "Prevents surprise add-ons at the appointment",
                                "Pre-writes professional responses for you",
                                "Links directly to your booking flow"
                            ].map((item, i) => (
                                <li key={i} className="flex items-center space-x-3 text-gray-700">
                                    <div className="bg-purple-100 p-1 rounded-full text-purple-600"><Zap size={14} /></div>
                                    <span>{item}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div>
                        <div className="bg-gray-100 rounded-[3rem] p-8 transform rotate-2 hover:rotate-0 transition-transform duration-500">
                            {/* Placeholder for UI screenshot */}
                            <div className="aspect-square bg-white rounded-2xl shadow-sm flex items-center justify-center text-gray-300">
                                <Sparkles size={64} />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Additional Features Grid */}
            <section className="py-24 px-6 bg-gray-50">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">More Than Just AI</h2>
                        <p className="text-gray-600">A complete toolkit for the independent nail artist.</p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                icon: Users,
                                title: "Client CRM",
                                desc: "Track client history, formulas, and preferences. Never forget a birthday or a favorite color."
                            },
                            {
                                icon: BarChart3,
                                title: "Income Analytics",
                                desc: "Visualize your earnings. See which services are your biggest money-makers."
                            },
                            {
                                icon: ImageIcon,
                                title: "Smart Portfolio",
                                desc: "Auto-organize your work by style and price. Show clients exactly what they can get for their budget."
                            },
                            {
                                icon: Clock,
                                title: "Time Management",
                                desc: "AI suggests realistic time duration for complex sets so you never run late."
                            },
                            {
                                icon: Shield,
                                title: "Policy Enforcement",
                                desc: "Polite but firm AI-generated texts to handle late clients and deposit policies."
                            },
                            {
                                icon: Heart,
                                title: "Client Retention",
                                desc: "Automated follow-ups to rebook clients who haven't visited in a while."
                            }
                        ].map((feature, i) => (
                            <div key={i} className="bg-white p-8 rounded-3xl shadow-sm hover:shadow-lg transition-all">
                                <div className="w-12 h-12 bg-pink-50 rounded-xl flex items-center justify-center text-pink-600 mb-6">
                                    <feature.icon size={24} />
                                </div>
                                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                                <p className="text-gray-600 text-sm leading-relaxed">{feature.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-24 px-6 text-center">
                <div className="max-w-3xl mx-auto bg-charcoal text-white rounded-[3rem] p-12 md:p-20 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-gray-800 to-black z-0"></div>
                    <div className="relative z-10">
                        <h2 className="text-3xl md:text-5xl font-serif font-bold mb-6">Ready to Upgrade Your Business?</h2>
                        <p className="text-gray-300 mb-8 text-lg">Join thousands of nail techs who are pricing with confidence.</p>
                        <button
                            onClick={() => navigate('/signup')}
                            className="bg-white text-charcoal px-8 py-4 rounded-full font-bold text-lg hover:bg-gray-100 transition-all shadow-xl"
                        >
                            Get Started for Free
                        </button>
                    </div>
                </div>
            </section>
        </div>
    );
}

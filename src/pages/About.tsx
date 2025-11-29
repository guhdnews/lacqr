import { Heart, Users, Star, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function About() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-white font-sans text-charcoal">
            {/* Header is already in PublicLayout, so we don't need it here if wrapped. 
                However, if this page is standalone, we might need it. 
                The user said "duplicated again", implying it's in the layout. 
                I will REMOVE it based on the plan. 
            */}

            {/* Hero */}
            <div className="bg-pink-50 py-24 px-6 text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-64 h-64 bg-pink-200 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 opacity-50"></div>
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-200 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 opacity-50"></div>

                <div className="relative z-10 max-w-4xl mx-auto">
                    <h1 className="text-4xl md:text-6xl font-serif font-bold mb-6 text-charcoal">
                        Built by Techs, <span className="text-pink-500">For Techs</span>
                    </h1>
                    <p className="text-xl md:text-2xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
                        We're on a mission to help nail artists stop undercharging and start thriving.
                    </p>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-6 py-24 space-y-32">
                {/* Our Story */}
                <div className="grid md:grid-cols-2 gap-12 items-center">
                    <div className="space-y-6">
                        <h2 className="text-3xl md:text-4xl font-serif font-bold">Our Story</h2>
                        <p className="text-lg text-gray-600 leading-relaxed">
                            Lacqr started with a simple observation: Nail techs are incredible artists, but often struggle with the business side. We saw talented friends undercharging for complex sets, spending hours in DMs explaining prices, and losing money on no-shows.
                        </p>
                        <p className="text-lg text-gray-600 leading-relaxed">
                            We realized that technology could bridge this gap. By using AI to objectively analyze designs and calculate prices, we could give techs the confidence to charge what they're worth.
                        </p>
                    </div>
                    <div className="relative">
                        <div className="aspect-square rounded-[2rem] overflow-hidden shadow-2xl rotate-3 hover:rotate-0 transition-transform duration-500">
                            <img src="/assets/feature_image_macro.png" alt="Nail Art Macro" className="w-full h-full object-cover" />
                        </div>
                        <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-2xl shadow-xl max-w-xs">
                            <p className="font-serif italic text-lg text-gray-800">"Finally, a tool that understands the value of our art."</p>
                        </div>
                    </div>
                </div>

                {/* Values */}
                <div className="space-y-12">
                    <div className="text-center max-w-2xl mx-auto">
                        <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">Why We Do It</h2>
                        <p className="text-gray-600 text-lg">Our core values drive every decision we make.</p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="text-center p-8 bg-gray-50 rounded-3xl hover:shadow-lg transition-shadow border border-gray-100">
                            <div className="w-16 h-16 bg-pink-100 rounded-2xl flex items-center justify-center text-pink-600 mx-auto mb-6 rotate-3">
                                <Heart size={32} />
                            </div>
                            <h3 className="font-bold text-xl mb-3">Empowerment</h3>
                            <p className="text-gray-600 leading-relaxed">We believe every artist deserves to be paid fairly for their skill and time. No more guessing games.</p>
                        </div>
                        <div className="text-center p-8 bg-gray-50 rounded-3xl hover:shadow-lg transition-shadow border border-gray-100">
                            <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center text-purple-600 mx-auto mb-6 -rotate-3">
                                <Users size={32} />
                            </div>
                            <h3 className="font-bold text-xl mb-3">Community</h3>
                            <p className="text-gray-600 leading-relaxed">We're building a supportive network of techs who lift each other up, share knowledge, and grow together.</p>
                        </div>
                        <div className="text-center p-8 bg-gray-50 rounded-3xl hover:shadow-lg transition-shadow border border-gray-100">
                            <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 mx-auto mb-6 rotate-3">
                                <Star size={32} />
                            </div>
                            <h3 className="font-bold text-xl mb-3">Innovation</h3>
                            <p className="text-gray-600 leading-relaxed">We use cutting-edge AI to solve real-world problems for small businesses, making tech accessible to everyone.</p>
                        </div>
                    </div>
                </div>

                {/* CTA */}
                <div className="bg-charcoal rounded-[3rem] p-12 md:p-24 text-center text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-pink-500 rounded-full blur-[100px] opacity-20 translate-x-1/2 -translate-y-1/2"></div>
                    <div className="relative z-10 max-w-3xl mx-auto space-y-8">
                        <h2 className="text-4xl md:text-5xl font-serif font-bold">Ready to Join the Revolution?</h2>
                        <p className="text-xl text-gray-400">Start pricing with confidence today.</p>
                        <button
                            onClick={() => navigate('/signup')}
                            className="bg-white text-charcoal px-8 py-4 rounded-full font-bold text-lg hover:bg-pink-50 transition-all shadow-lg hover:scale-105 active:scale-95 inline-flex items-center gap-2"
                        >
                            Get Started Free <ArrowRight size={20} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

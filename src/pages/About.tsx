import Header from '../components/Header';
import Footer from '../components/Footer';
import { Heart, Users, Star } from 'lucide-react';

export default function About() {
    return (
        <div className="min-h-screen bg-white font-sans text-charcoal">
            <Header />

            {/* Hero */}
            <div className="bg-pink-50 py-24 px-6 text-center">
                <h1 className="text-4xl md:text-5xl font-serif font-bold mb-6">Built by Techs, For Techs</h1>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                    We're on a mission to help nail artists stop undercharging and start thriving.
                </p>
            </div>

            <div className="max-w-4xl mx-auto px-6 py-24 space-y-24">
                {/* Our Story */}
                <div className="space-y-6">
                    <h2 className="text-3xl font-serif font-bold">Our Story</h2>
                    <p className="text-lg text-gray-600 leading-relaxed">
                        Lacqr started with a simple observation: Nail techs are incredible artists, but often struggle with the business side. We saw talented friends undercharging for complex sets, spending hours in DMs explaining prices, and losing money on no-shows.
                    </p>
                    <p className="text-lg text-gray-600 leading-relaxed">
                        We realized that technology could bridge this gap. By using AI to objectively analyze designs and calculate prices, we could give techs the confidence to charge what they're worth.
                    </p>
                </div>

                {/* Values */}
                <div className="grid md:grid-cols-3 gap-8">
                    <div className="text-center p-6 bg-gray-50 rounded-3xl">
                        <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center text-pink-600 mx-auto mb-4">
                            <Heart size={24} />
                        </div>
                        <h3 className="font-bold text-xl mb-2">Empowerment</h3>
                        <p className="text-gray-600">We believe every artist deserves to be paid fairly for their skill and time.</p>
                    </div>
                    <div className="text-center p-6 bg-gray-50 rounded-3xl">
                        <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center text-pink-600 mx-auto mb-4">
                            <Users size={24} />
                        </div>
                        <h3 className="font-bold text-xl mb-2">Community</h3>
                        <p className="text-gray-600">We're building a supportive network of techs who lift each other up.</p>
                    </div>
                    <div className="text-center p-6 bg-gray-50 rounded-3xl">
                        <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center text-pink-600 mx-auto mb-4">
                            <Star size={24} />
                        </div>
                        <h3 className="font-bold text-xl mb-2">Innovation</h3>
                        <p className="text-gray-600">We use cutting-edge AI to solve real-world problems for small businesses.</p>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
}

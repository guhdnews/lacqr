import { CheckCircle, Smartphone, Zap, Clock, DollarSign, MessageCircle } from 'lucide-react';
import Footer from '../components/Footer';
import Header from '../components/Header';

export default function Features() {
    return (
        <div className="min-h-screen bg-white font-sans text-charcoal">
            <Header />

            {/* Hero */}
            <div className="bg-pink-50 py-24 px-6 text-center">
                <h1 className="text-5xl md:text-6xl font-serif font-bold mb-6">The Toolkit for Modern Nail Techs</h1>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                    Stop using five different apps to run your business. Lacqr combines AI pricing, booking intelligence, and client management into one seamless workflow.
                </p>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-24">
                {/* QuoteCam Deep Dive */}
                <div className="grid md:grid-cols-2 gap-16 mb-32 items-center">
                    <div className="space-y-8">
                        <h2 className="text-4xl font-serif font-bold">QuoteCam™: Your Pricing Guardian</h2>
                        <p className="text-lg text-gray-600 leading-relaxed">
                            Undercharging is the #1 killer of nail businesses. QuoteCam uses advanced computer vision to analyze inspo pics and finished sets, identifying every cost driver that usually slips through the cracks. It's like having a business manager in your pocket.
                        </p>

                        <div className="space-y-6">
                            <div className="flex items-start space-x-4">
                                <div className="bg-green-100 p-2 rounded-lg text-green-600 mt-1"><CheckCircle size={20} /></div>
                                <div>
                                    <h4 className="font-bold text-lg">Granular Detection</h4>
                                    <p className="text-gray-600">It doesn't just see "nails." It sees "XL Coffin," "Chrome Powder," "3D Charms," and "French Tips." It counts every gem so you don't have to.</p>
                                </div>
                            </div>
                            <div className="flex items-start space-x-4">
                                <div className="bg-green-100 p-2 rounded-lg text-green-600 mt-1"><DollarSign size={20} /></div>
                                <div>
                                    <h4 className="font-bold text-lg">Customizable Price Lists</h4>
                                    <p className="text-gray-600">Map our AI detections to YOUR specific service menu. We don't dictate prices; we enforce yours, ensuring consistency across every client.</p>
                                </div>
                            </div>
                            <div className="flex items-start space-x-4">
                                <div className="bg-green-100 p-2 rounded-lg text-green-600 mt-1"><CheckCircle size={20} /></div>
                                <div>
                                    <h4 className="font-bold text-lg">Instant Receipts</h4>
                                    <p className="text-gray-600">Generate a professional, itemized image to send to clients. No more awkward "why is it so much?" conversations—just clear, transparent pricing.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="bg-gray-100 rounded-[3rem] h-[600px] w-full shadow-2xl border border-gray-200 relative overflow-hidden">
                        <div className="absolute inset-0 flex items-center justify-center text-gray-400 font-serif italic">
                            Interactive QuoteCam Demo UI
                        </div>
                    </div>
                </div>

                {/* Service Sorter Deep Dive */}
                <div className="grid md:grid-cols-2 gap-16 mb-32 items-center">
                    <div className="bg-gray-100 rounded-[3rem] h-[600px] w-full shadow-2xl border border-gray-200 relative overflow-hidden order-2 md:order-1">
                        <div className="absolute inset-0 flex items-center justify-center text-gray-400 font-serif italic">
                            Service Sorter Chat UI
                        </div>
                    </div>
                    <div className="space-y-8 order-1 md:order-2">
                        <h2 className="text-4xl font-serif font-bold">Service Sorter: The Booking Translator</h2>
                        <p className="text-lg text-gray-600 leading-relaxed">
                            "What do I book for this?" It's the question that clogs your DMs. Service Sorter analyzes client requests and tells them exactly which buttons to click on your booking site, reducing booking errors and surprise add-ons.
                        </p>

                        <div className="space-y-6">
                            <div className="flex items-start space-x-4">
                                <div className="bg-blue-100 p-2 rounded-lg text-blue-600 mt-1"><MessageCircle size={20} /></div>
                                <div>
                                    <h4 className="font-bold text-lg">DM Integration</h4>
                                    <p className="text-gray-600">Copy-paste the client's message or photo, and we'll generate the perfect reply with a direct booking link. Save hours of admin time every week.</p>
                                </div>
                            </div>
                            <div className="flex items-start space-x-4">
                                <div className="bg-blue-100 p-2 rounded-lg text-blue-600 mt-1"><Clock size={20} /></div>
                                <div>
                                    <h4 className="font-bold text-lg">Time Estimation</h4>
                                    <p className="text-gray-600">We calculate the estimated time for the design so you don't run late for your next appointment. Keep your schedule running smooth.</p>
                                </div>
                            </div>
                            <div className="flex items-start space-x-4">
                                <div className="bg-blue-100 p-2 rounded-lg text-blue-600 mt-1"><Zap size={20} /></div>
                                <div>
                                    <h4 className="font-bold text-lg">Upsell Opportunities</h4>
                                    <p className="text-gray-600">Our AI suggests relevant add-ons based on the design, helping you increase your ticket size without being pushy.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Additional Features Grid */}
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-serif font-bold mb-4">Everything Else You Get</h2>
                </div>
                <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                    {[
                        { icon: Smartphone, title: "Mobile First Design", desc: "Built entirely for your phone, because that's where you run your business. No laptop required." },
                        { icon: CheckCircle, title: "Client History", desc: "Keep track of past sets and prices for every client, making rebooking a breeze." }
                    ].map((feat, i) => (
                        <div key={i} className="bg-gray-50 p-8 rounded-3xl hover:bg-pink-50 transition-colors">
                            <feat.icon className="text-pink-500 mb-4" size={32} />
                            <h3 className="text-xl font-bold mb-2">{feat.title}</h3>
                            <p className="text-gray-600">{feat.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
            <Footer />
        </div>
    );
}

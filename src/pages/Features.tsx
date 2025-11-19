import { CheckCircle, Camera, Sparkles } from 'lucide-react';
import Footer from '../components/Footer';

export default function Features() {
    return (
        <div className="min-h-screen bg-white font-sans text-charcoal">
            <div className="max-w-7xl mx-auto px-6 py-24">
                <h1 className="text-5xl font-serif font-bold mb-12 text-center">Features that Power Your Business</h1>

                <div className="grid md:grid-cols-2 gap-16 mb-24">
                    <div className="space-y-6">
                        <div className="w-16 h-16 bg-pink-50 rounded-2xl flex items-center justify-center text-pink-600">
                            <Camera size={32} />
                        </div>
                        <h2 className="text-3xl font-bold">QuoteCam™</h2>
                        <p className="text-lg text-gray-600 leading-relaxed">
                            Stop guessing prices. Our AI analyzes nail art photos to identify every cost driver—from length and shape to specific charms and techniques.
                        </p>
                        <ul className="space-y-3 text-gray-600">
                            <li className="flex items-center"><CheckCircle size={20} className="text-pink-500 mr-3" /> Instant itemized receipts</li>
                            <li className="flex items-center"><CheckCircle size={20} className="text-pink-500 mr-3" /> Customizable price lists</li>
                            <li className="flex items-center"><CheckCircle size={20} className="text-pink-500 mr-3" /> Time estimation</li>
                        </ul>
                    </div>
                    <div className="bg-gray-100 rounded-3xl h-96 w-full"></div> {/* Placeholder for image */}
                </div>

                <div className="grid md:grid-cols-2 gap-16 mb-24">
                    <div className="bg-gray-100 rounded-3xl h-96 w-full order-2 md:order-1"></div> {/* Placeholder for image */}
                    <div className="space-y-6 order-1 md:order-2">
                        <div className="w-16 h-16 bg-pink-50 rounded-2xl flex items-center justify-center text-pink-600">
                            <Sparkles size={32} />
                        </div>
                        <h2 className="text-3xl font-bold">Service Sorter</h2>
                        <p className="text-lg text-gray-600 leading-relaxed">
                            Eliminate booking confusion. We translate vague client requests into exact booking codes for your scheduling software.
                        </p>
                        <ul className="space-y-3 text-gray-600">
                            <li className="flex items-center"><CheckCircle size={20} className="text-pink-500 mr-3" /> Auto-generated booking links</li>
                            <li className="flex items-center"><CheckCircle size={20} className="text-pink-500 mr-3" /> Pre-written client responses</li>
                            <li className="flex items-center"><CheckCircle size={20} className="text-pink-500 mr-3" /> Reduces DM back-and-forth</li>
                        </ul>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
}

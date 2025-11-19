import Header from '../components/Header';
import Footer from '../components/Footer';
import { ChevronDown } from 'lucide-react';

export default function FAQ() {
    return (
        <div className="min-h-screen bg-white font-sans text-charcoal">
            <Header />

            <div className="bg-pink-50 py-24 px-6 text-center">
                <h1 className="text-4xl md:text-5xl font-serif font-bold mb-6">Frequently Asked Questions</h1>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                    Everything you need to know about Lacqr.
                </p>
            </div>

            <div className="max-w-3xl mx-auto px-6 py-24 space-y-6">
                {[
                    { q: "How does the AI pricing work?", a: "Our AI analyzes photos of nail designs to identify components like length, shape, chrome, gems, and art complexity. It then calculates a price based on your customizable service menu." },
                    { q: "Can I use my own prices?", a: "Yes! The Pro plan allows you to upload your specific price list. The AI will map its findings to your prices, ensuring quotes are accurate for your salon." },
                    { q: "Is my data private?", a: "Absolutely. Your photos and business data are encrypted and never shared. We use them only to improve the accuracy of your personal AI model." },
                    { q: "Do I need to be tech-savvy?", a: "Not at all. Lacqr is designed to be as easy as posting to Instagram. If you can take a photo, you can use Lacqr." },
                    { q: "Can I cancel anytime?", a: "Yes, there are no long-term contracts. You can cancel your subscription at any time from your account settings." },
                    { q: "Does it work for acrylic and gel?", a: "Yes, our AI is trained on all major nail systems including Acrylic, Gel-X, Hard Gel, and Polygel." }
                ].map((item, i) => (
                    <div key={i} className="bg-white border border-gray-200 p-6 rounded-2xl hover:border-pink-200 transition-colors cursor-pointer group">
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="font-bold text-lg">{item.q}</h3>
                            <ChevronDown className="text-gray-400 group-hover:text-pink-500 transition-colors" size={20} />
                        </div>
                        <p className="text-gray-600 leading-relaxed">{item.a}</p>
                    </div>
                ))}
            </div>
            <Footer />
        </div>
    );
}

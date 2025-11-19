import Footer from '../components/Footer';

export default function FAQ() {
    const faqs = [
        { q: "How accurate is the pricing AI?", a: "Our AI is trained on thousands of nail designs. It's highly accurate at identifying components, but you always have the final say to adjust the price before sending it." },
        { q: "Can I use my own price list?", a: "Yes! In the Pro plan, you can upload your specific service menu prices so the AI quotes match your salon's rates exactly." },
        { q: "Does it work for all nail shapes?", a: "Absolutely. QuoteCam recognizes all standard shapes (Almond, Coffin, Square, Stiletto) and lengths." },
        { q: "Is there a free trial?", a: "We offer a free Starter plan that includes 5 scans per month forever. No credit card required." },
        { q: "Can I cancel anytime?", a: "Yes, you can cancel your Pro subscription at any time from your account settings." }
    ];

    return (
        <div className="min-h-screen bg-white font-sans text-charcoal">
            <div className="max-w-3xl mx-auto px-6 py-24">
                <h1 className="text-5xl font-serif font-bold mb-12 text-center">Frequently Asked Questions</h1>
                <div className="space-y-8">
                    {faqs.map((item, i) => (
                        <div key={i} className="bg-gray-50 p-8 rounded-3xl">
                            <h4 className="font-bold text-xl mb-3">{item.q}</h4>
                            <p className="text-gray-600 leading-relaxed">{item.a}</p>
                        </div>
                    ))}
                </div>
            </div>
            <Footer />
        </div>
    );
}

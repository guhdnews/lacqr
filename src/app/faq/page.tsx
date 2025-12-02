'use client';

import { Search } from 'lucide-react';
import { useState } from 'react';

export default function FAQ() {
    const [searchQuery, setSearchQuery] = useState('');

    const faqs = [
        {
            category: "General",
            questions: [
                { q: "What exactly does Lacqr do?", a: "Lacqr is an AI-powered assistant for nail technicians. It analyzes photos of nail designs to help you price them accurately, generates booking instructions for clients, and manages your client history." },
                { q: "Is Lacqr a booking site?", a: "Lacqr integrates with your existing booking flow. While we provide a public profile and service menu, our main goal is to help you quote prices and direct clients to book the correct services on whatever platform you use (GlossGenius, Vagaro, DM, etc.)." },
                { q: "Do I need to download an app?", a: "No, Lacqr is a web application. You can access it from any browser on your phone, tablet, or laptop. It works just like an app but without the download." }
            ]
        },
        {
            category: "Pricing & AI",
            questions: [
                { q: "How accurate is the AI pricing?", a: "Our AI is trained on thousands of nail sets and is highly accurate at identifying components like length, shape, and art complexity. However, YOU control the base prices. The AI suggests a total based on your settings, but you can always edit the final quote before sending it." },
                { q: "Can I customize my prices?", a: "Yes! On the Pro plan, you can set your specific prices for every variable—how much you charge for XL length, for chrome, for 3D charms, etc. The AI uses YOUR price list to generate quotes." },
                { q: "Does it work for acrylic and gel?", a: "Yes, Lacqr works for all nail systems including Gel-X, Acrylic, Hard Gel, and natural nails." }
            ]
        },
        {
            category: "Account & Billing",
            questions: [
                { q: "Is there a free trial?", a: "We offer a 'Starter' plan that is free forever. It includes 5 AI scans per month so you can try it out risk-free." },
                { q: "How do I upgrade to Pro?", a: "You can upgrade to the Pro Boss plan anytime from your Settings page. It unlocks unlimited scans and advanced customization." },
                { q: "Can I cancel my subscription?", a: "Yes, you can cancel at any time. You will retain access to Pro features until the end of your current billing period." }
            ]
        }
    ];

    const filteredFaqs = faqs.map(cat => ({
        ...cat,
        questions: cat.questions.filter(q =>
            q.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
            q.a.toLowerCase().includes(searchQuery.toLowerCase())
        )
    })).filter(cat => cat.questions.length > 0);

    return (
        <div className="font-sans text-charcoal min-h-screen bg-gray-50">
            {/* Header */}
            <section className="bg-white border-b border-gray-100 py-20 px-6 text-center">
                <h1 className="text-4xl md:text-5xl font-serif font-bold mb-6">How can we help?</h1>
                <div className="max-w-xl mx-auto relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search for answers..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 rounded-full border border-gray-200 focus:border-pink-500 focus:ring-2 focus:ring-pink-100 outline-none transition-all shadow-sm"
                    />
                </div>
            </section>

            {/* FAQ Grid */}
            <section className="py-20 px-6">
                <div className="max-w-4xl mx-auto space-y-12">
                    {filteredFaqs.length > 0 ? (
                        filteredFaqs.map((category, i) => (
                            <div key={i}>
                                <h3 className="text-2xl font-bold mb-6 text-pink-600">{category.category}</h3>
                                <div className="grid gap-6">
                                    {category.questions.map((item, j) => (
                                        <div key={j} className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                                            <h4 className="text-lg font-bold mb-3">{item.q}</h4>
                                            <p className="text-gray-600 leading-relaxed">{item.a}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-12 text-gray-500">
                            No results found for &quot;{searchQuery}&quot;. Try a different keyword.
                        </div>
                    )}
                </div>
            </section>

            {/* Contact CTA */}
            <section className="py-20 px-6 text-center">
                <h3 className="text-2xl font-bold mb-4">Still have questions?</h3>
                <p className="text-gray-600 mb-8">We&apos;re here to help you get set up.</p>
                <a
                    href="mailto:hello@lacqr.io"
                    className="inline-block bg-white border border-gray-200 text-charcoal px-8 py-3 rounded-full font-medium hover:bg-gray-50 transition-colors"
                >
                    Contact Support
                </a>
            </section>
        </div>
    );
}

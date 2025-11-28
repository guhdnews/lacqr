import { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp, MessageCircle, BookOpen, ExternalLink, Mail } from 'lucide-react';
import HelpModal from '../components/HelpModal';

export default function Help() {
    const [openFaq, setOpenFaq] = useState<number | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [modalContext, setModalContext] = useState<'lacqr_lens' | 'smart_quote'>('lacqr_lens');

    const faqs = [
        {
            question: "How accurate is the AI pricing?",
            answer: "Lacqr's AI is trained on thousands of nail designs to identify shapes, lengths, and art complexities. However, it provides an *estimate*. You should always review and adjust the prices based on your specific salon rates and the actual time required."
        },
        {
            question: "Can I customize the service menu?",
            answer: "Yes! We are currently rolling out the Service Menu Editor. Soon you will be able to set your own base prices for shapes, lengths, and specific add-ons so the AI quotes match your price list exactly."
        },
        {
            question: "Is my data private?",
            answer: "Absolutely. We do not share your client data or uploaded images with third parties for marketing. Images are processed securely to generate the analysis and then discarded unless you choose to save them to your portfolio."
        },
        {
            question: "How do I use Smart Quote?",
            answer: "Upload an inspiration picture sent by a client. Smart Quote will analyze it and generate a polite, professional text message reply that includes the estimated time, price range, and booking instructions."
        }
    ];

    const toggleFaq = (index: number) => {
        setOpenFaq(openFaq === index ? null : index);
    };

    const openHelp = (context: 'lacqr_lens' | 'smart_quote') => {
        setModalContext(context);
        setShowModal(true);
    };

    return (
        <div className="max-w-2xl mx-auto px-4 py-8 space-y-12">
            <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto">
                    <HelpCircle size={32} className="text-pink-500" />
                </div>
                <h1 className="text-3xl font-bold text-charcoal font-display">How can we help?</h1>
                <p className="text-gray-600">Guides, answers, and support for your nail business.</p>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                    onClick={() => openHelp('lacqr_lens')}
                    className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:border-pink-200 transition-colors group cursor-pointer text-left"
                >
                    <BookOpen className="text-pink-500 mb-4 group-hover:scale-110 transition-transform" size={24} />
                    <h3 className="font-bold text-lg text-charcoal mb-2">Getting Started Guide</h3>
                    <p className="text-sm text-gray-500 mb-4">Learn the basics of scanning, quoting, and managing your services.</p>
                    <span className="text-pink-500 text-sm font-bold flex items-center">
                        Read Guide <ExternalLink size={14} className="ml-1" />
                    </span>
                </button>
                <button
                    onClick={() => openHelp('smart_quote')}
                    className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:border-pink-200 transition-colors group cursor-pointer text-left"
                >
                    <MessageCircle className="text-purple-500 mb-4 group-hover:scale-110 transition-transform" size={24} />
                    <h3 className="font-bold text-lg text-charcoal mb-2">Smart Quote Tips</h3>
                    <p className="text-sm text-gray-500 mb-4">Master the art of replying to DMs and converting inquiries into bookings.</p>
                    <span className="text-purple-500 text-sm font-bold flex items-center">
                        View Tips <ExternalLink size={14} className="ml-1" />
                    </span>
                </button>
            </div>

            {/* FAQs */}
            <div className="space-y-6">
                <h2 className="text-2xl font-bold text-charcoal font-display">Frequently Asked Questions</h2>
                <div className="space-y-4">
                    {faqs.map((faq, index) => (
                        <div key={index} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                            <button
                                onClick={() => toggleFaq(index)}
                                className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
                            >
                                <span className="font-bold text-charcoal">{faq.question}</span>
                                {openFaq === index ? (
                                    <ChevronUp size={20} className="text-gray-400" />
                                ) : (
                                    <ChevronDown size={20} className="text-gray-400" />
                                )}
                            </button>
                            {openFaq === index && (
                                <div className="p-4 pt-0 text-gray-600 text-sm leading-relaxed border-t border-gray-50 bg-gray-50/50">
                                    {faq.answer}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Contact Support */}
            <div className="bg-charcoal text-white rounded-3xl p-8 text-center relative overflow-hidden">
                <div className="relative z-10">
                    <h2 className="text-2xl font-bold mb-2">Still need help?</h2>
                    <p className="text-gray-300 mb-6">Our support team is just an email away.</p>
                    <a
                        href="mailto:support@lacqr.app"
                        className="inline-flex items-center bg-white text-charcoal px-6 py-3 rounded-xl font-bold hover:bg-gray-100 transition-colors"
                    >
                        <Mail size={18} className="mr-2" />
                        Contact Support
                    </a>
                </div>

                {/* Decorative Background */}
                <div className="absolute top-0 right-0 -mt-8 -mr-8 w-32 h-32 bg-pink-500 rounded-full blur-3xl opacity-20"></div>
                <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-32 h-32 bg-purple-500 rounded-full blur-3xl opacity-20"></div>
            </div>

            <HelpModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                context={modalContext}
            />
        </div>
    );
}

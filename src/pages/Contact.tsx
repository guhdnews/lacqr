import Footer from '../components/Footer';
import { Mail, MapPin, Phone } from 'lucide-react';

export default function Contact() {
    return (
        <div className="min-h-screen bg-white font-sans text-charcoal">
            <div className="max-w-7xl mx-auto px-6 py-24">
                <h1 className="text-5xl font-serif font-bold mb-16 text-center">Get in Touch</h1>

                <div className="grid md:grid-cols-2 gap-16">
                    <div>
                        <h2 className="text-2xl font-bold mb-6">We'd love to hear from you.</h2>
                        <p className="text-gray-600 mb-8">
                            Have a question about pricing? Found a bug? Just want to say hi?
                            Drop us a line and we'll get back to you as soon as possible.
                        </p>

                        <div className="space-y-6">
                            <div className="flex items-center space-x-4 text-gray-600">
                                <Mail className="text-pink-500" />
                                <span>hello@lacqr.io</span>
                            </div>
                            <div className="flex items-center space-x-4 text-gray-600">
                                <MapPin className="text-pink-500" />
                                <span>Los Angeles, CA</span>
                            </div>
                        </div>
                    </div>

                    <form className="space-y-6">
                        <div>
                            <label className="block text-sm font-bold mb-2">Name</label>
                            <input type="text" className="w-full border border-gray-200 rounded-xl p-4 focus:outline-none focus:border-pink-500" placeholder="Your Name" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold mb-2">Email</label>
                            <input type="email" className="w-full border border-gray-200 rounded-xl p-4 focus:outline-none focus:border-pink-500" placeholder="hello@example.com" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold mb-2">Message</label>
                            <textarea className="w-full border border-gray-200 rounded-xl p-4 h-32 focus:outline-none focus:border-pink-500" placeholder="How can we help?"></textarea>
                        </div>
                        <button className="bg-charcoal text-white px-8 py-4 rounded-xl font-bold hover:bg-black transition-colors w-full">
                            Send Message
                        </button>
                    </form>
                </div>
            </div>
            <Footer />
        </div>
    );
}

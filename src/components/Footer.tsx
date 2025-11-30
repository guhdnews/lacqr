import { Instagram, Twitter, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
    return (
        <footer className="bg-white border-t border-gray-100 pt-16 pb-8 px-6">
            <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-12 mb-12">
                {/* Brand */}
                <div className="space-y-4">
                    <Link to="/" className="text-2xl font-serif font-bold tracking-tight text-charcoal block hover:text-pink-600 transition-all hover:scale-105 active:scale-95 origin-left">Lacqr</Link>
                    <p className="text-gray-500 text-sm leading-relaxed">
                        Empowering nail technicians with AI tools to price with confidence and book with ease.
                    </p>
                    <div className="flex space-x-4 text-gray-400">
                        <Instagram size={20} className="hover:text-pink-500 cursor-pointer transition-colors" />
                        <Twitter size={20} className="hover:text-pink-500 cursor-pointer transition-colors" />
                        <Mail size={20} className="hover:text-pink-500 cursor-pointer transition-colors" />
                    </div>
                </div>

                {/* Product */}
                <li><Link to="/blog" className="hover:text-pink-500 transition-colors">Blog</Link></li>
                <li><Link to="/contact" className="hover:text-pink-500 transition-colors">Contact</Link></li>
            </ul>
        </div>

                {/* Newsletter */ }
    <div>
        <h4 className="font-bold mb-4">Stay Updated</h4>
        <p className="text-xs text-gray-400 mb-4">Get the latest tips on pricing and business growth.</p>
        <div className="flex">
            <input
                type="email"
                placeholder="Email address"
                className="bg-gray-50 border border-gray-200 rounded-l-lg px-4 py-2 text-sm w-full focus:outline-none focus:border-pink-300"
            />
            <button className="bg-charcoal text-white px-4 py-2 rounded-r-lg text-sm font-medium hover:bg-black transition-colors">
                Join
            </button>
        </div>
    </div>
            </div >

        <div className="max-w-7xl mx-auto border-t border-gray-100 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-gray-400">
            <p>© 2024 Lacqr. All rights reserved.</p>
            <div className="flex space-x-6 mt-4 md:mt-0">
                <Link to="/privacy" className="hover:text-charcoal transition-colors">Privacy Policy</Link>
                <Link to="/terms" className="hover:text-charcoal transition-colors">Terms of Service</Link>
            </div>
        </div>
        </footer >
    );
}

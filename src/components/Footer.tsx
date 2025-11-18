import { Instagram, Twitter, Mail } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="bg-pink-50 pt-16 pb-8 px-6">
            <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-12 mb-12">
                {/* Brand Column */}
                <div className="space-y-4">
                    <h3 className="font-serif text-2xl font-bold text-charcoal">Lacqr</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                        The AI co-pilot for modern nail technicians. Stop guessing prices, start scaling your business.
                    </p>
                    <div className="flex space-x-4 text-gray-400">
                        <a href="#" className="hover:text-pink-500 transition-colors"><Instagram size={20} /></a>
                        <a href="#" className="hover:text-pink-500 transition-colors"><Twitter size={20} /></a>
                        <a href="#" className="hover:text-pink-500 transition-colors"><Mail size={20} /></a>
                    </div>
                </div>

                {/* Product Column */}
                <div>
                    <h4 className="font-bold mb-4 text-charcoal">Product</h4>
                    <ul className="space-y-2 text-sm text-gray-600">
                        <li><a href="#" className="hover:text-pink-500">QuoteCam</a></li>
                        <li><a href="#" className="hover:text-pink-500">Service Sorter</a></li>
                        <li><a href="#" className="hover:text-pink-500">Pricing</a></li>
                        <li><a href="#" className="hover:text-pink-500">Login</a></li>
                    </ul>
                </div>

                {/* Company Column */}
                <div>
                    <h4 className="font-bold mb-4 text-charcoal">Company</h4>
                    <ul className="space-y-2 text-sm text-gray-600">
                        <li><a href="#" className="hover:text-pink-500">About Us</a></li>
                        <li><a href="#" className="hover:text-pink-500">Blog</a></li>
                        <li><a href="#" className="hover:text-pink-500">Careers</a></li>
                        <li><a href="#" className="hover:text-pink-500">Contact</a></li>
                    </ul>
                </div>

                {/* Newsletter Column */}
                <div>
                    <h4 className="font-bold mb-4 text-charcoal">Stay in the Loop</h4>
                    <p className="text-xs text-gray-500 mb-4">Get the latest tips on pricing and nail tech business growth.</p>
                    <div className="flex">
                        <input
                            type="email"
                            placeholder="Enter your email"
                            className="bg-white border border-gray-200 rounded-l-lg px-4 py-2 text-sm w-full focus:outline-none focus:border-pink-300"
                        />
                        <button className="bg-charcoal text-white px-4 py-2 rounded-r-lg text-sm font-medium hover:bg-black transition-colors">
                            Join
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto border-t border-pink-100 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-gray-400">
                <p>© 2024 Lacqr. All rights reserved.</p>
                <div className="flex space-x-6 mt-4 md:mt-0">
                    <a href="#" className="hover:text-charcoal">Privacy Policy</a>
                    <a href="#" className="hover:text-charcoal">Terms of Service</a>
                </div>
            </div>
        </footer>
    );
}

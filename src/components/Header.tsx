import { useNavigate, Link } from 'react-router-dom';

export default function Header() {
    const navigate = useNavigate();

    return (
        <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-pink-50">
            <div className="flex justify-between items-center px-6 py-4 max-w-7xl mx-auto">
                <Link to="/" className="text-2xl font-serif font-bold tracking-tight text-charcoal cursor-pointer hover:text-pink-600 transition-colors">
                    Lacqr
                </Link>

                <div className="hidden md:flex items-center space-x-8 text-sm font-medium text-gray-600">
                    <Link to="/features" className="hover:text-pink-500 transition-colors">Features</Link>
                    <Link to="/pricing" className="hover:text-pink-500 transition-colors">Pricing</Link>
                    <Link to="/faq" className="hover:text-pink-500 transition-colors">FAQ</Link>
                    <Link to="/about" className="hover:text-pink-500 transition-colors">About</Link>
                    <Link to="/blog" className="hover:text-pink-500 transition-colors">Blog</Link>
                    <Link to="/contact" className="hover:text-pink-500 transition-colors">Contact</Link>
                </div>

                <div className="flex items-center space-x-4">
                    <Link
                        to="/login"
                        className="text-sm font-medium hover:text-pink-500 transition-colors hidden sm:block"
                    >
                        Log In
                    </Link>
                    <button
                        onClick={() => navigate('/signup')}
                        className="bg-charcoal text-white px-5 py-2.5 rounded-full text-sm font-medium hover:bg-black transition-all shadow-md hover:shadow-lg"
                    >
                        Get Started
                    </button>
                </div>
            </div>
        </nav>
    );
}

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

export default function Header() {
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

    return (
        <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-pink-50">
            <div className="flex justify-between items-center px-6 py-4 max-w-7xl mx-auto">
                <Link
                    to="/"
                    className="text-2xl font-serif font-bold tracking-tight text-charcoal cursor-pointer hover:text-pink-600 transition-all hover:scale-105 active:scale-95"
                >
                    Lacqr
                </Link>

                {/* Desktop Navigation */}
                <div className="hidden md:flex items-center space-x-8 text-sm font-medium text-gray-600">
                    <a href="/#features" className="hover:text-pink-500 transition-colors">Features</a>
                    <a href="/#pricing" className="hover:text-pink-500 transition-colors">Pricing</a>
                    <a href="/#about" className="hover:text-pink-500 transition-colors">About</a>
                    <a href="/#faq" className="hover:text-pink-500 transition-colors">FAQ</a>
                </div>

                <div className="hidden md:flex items-center space-x-4">
                    <Link
                        to="/login"
                        className="text-sm font-medium hover:text-pink-500 transition-colors"
                    >
                        Log In
                    </Link>
                    <button
                        onClick={() => navigate('/signup')}
                        className="bg-charcoal text-white px-5 py-2.5 rounded-full text-sm font-medium hover:bg-black transition-all shadow-md hover:shadow-lg hover:scale-105 active:scale-95"
                    >
                        Get Started
                    </button>
                </div>

                {/* Mobile Menu Button */}
                <button className="md:hidden text-gray-600" onClick={toggleMenu}>
                    {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Mobile Menu Overlay */}
            {isMenuOpen && (
                <div className="md:hidden absolute top-full left-0 w-full bg-white border-b border-pink-50 shadow-lg py-4 px-6 flex flex-col space-y-4">
                    <a href="/#features" className="text-gray-600 hover:text-pink-500 font-medium" onClick={toggleMenu}>Features</a>
                    <a href="/#pricing" className="text-gray-600 hover:text-pink-500 font-medium" onClick={toggleMenu}>Pricing</a>
                    <a href="/#about" className="text-gray-600 hover:text-pink-500 font-medium" onClick={toggleMenu}>About</a>
                    <a href="/#faq" className="text-gray-600 hover:text-pink-500 font-medium" onClick={toggleMenu}>FAQ</a>
                    <hr className="border-pink-50" />
                    <Link to="/login" className="text-gray-600 hover:text-pink-500 font-medium" onClick={toggleMenu}>Log In</Link>
                    <button
                        onClick={() => {
                            navigate('/signup');
                            toggleMenu();
                        }}
                        className="bg-charcoal text-white px-5 py-3 rounded-xl text-sm font-bold hover:bg-black transition-all shadow-md w-full"
                    >
                        Get Started
                    </button>
                </div>
            )}
        </nav>
    );
}

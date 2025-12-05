'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';

export default function Header() {
    const router = useRouter();
    const { user } = useAppStore();
    const pathname = usePathname();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

    // Hide Header on Dashboard pages (Sidebar handles nav there)
    if (pathname?.startsWith('/dashboard')) {
        return null;
    }

    return (
        <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-pink-50">
            <div className="flex justify-between items-center px-6 py-4 max-w-7xl mx-auto">
                <Link
                    href="/"
                    className="text-2xl font-serif font-bold tracking-tight text-charcoal cursor-pointer hover:text-pink-600 transition-all hover:scale-105 active:scale-95"
                >
                    Lacqr
                </Link>

                {/* Desktop Navigation */}
                <div className="hidden md:flex items-center space-x-8 text-sm font-medium text-gray-600">
                    <Link href="/features" className="hover:text-pink-500 transition-colors">Features</Link>
                    <Link href="/pricing" className="hover:text-pink-500 transition-colors">Pricing</Link>
                    <Link href="/about" className="hover:text-pink-500 transition-colors">About</Link>
                    <Link href="/faq" className="hover:text-pink-500 transition-colors">FAQ</Link>
                </div>

                <div className="hidden md:flex items-center space-x-4">
                    {user.isAuthenticated ? (
                        <button
                            onClick={() => router.push('/dashboard')}
                            className="bg-charcoal text-white px-5 py-2.5 rounded-full text-sm font-medium hover:bg-black transition-all shadow-md hover:shadow-lg hover:scale-105 active:scale-95"
                        >
                            Go to Dashboard
                        </button>
                    ) : (
                        <>
                            <Link
                                href="/login"
                                className="text-sm font-medium hover:text-pink-500 transition-colors"
                            >
                                Log In
                            </Link>
                            <button
                                onClick={() => router.push('/signup')}
                                className="bg-charcoal text-white px-5 py-2.5 rounded-full text-sm font-medium hover:bg-black transition-all shadow-md hover:shadow-lg hover:scale-105 active:scale-95"
                            >
                                Get Started
                            </button>
                        </>
                    )}
                </div>

                {/* Mobile Menu Button */}
                <button
                    className="md:hidden text-gray-600 p-2 -mr-2"
                    onClick={toggleMenu}
                    aria-label="Toggle menu"
                    aria-expanded={isMenuOpen}
                >
                    {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Mobile Menu Overlay */}
            {isMenuOpen && (
                <div className="md:hidden absolute top-full left-0 w-full bg-white border-b border-pink-50 shadow-lg py-4 px-6 flex flex-col space-y-4 animate-in slide-in-from-top-2">
                    <Link href="/features" className="text-gray-600 hover:text-pink-500 font-medium py-2" onClick={toggleMenu}>Features</Link>
                    <Link href="/pricing" className="text-gray-600 hover:text-pink-500 font-medium py-2" onClick={toggleMenu}>Pricing</Link>
                    <Link href="/about" className="text-gray-600 hover:text-pink-500 font-medium py-2" onClick={toggleMenu}>About</Link>
                    <Link href="/faq" className="text-gray-600 hover:text-pink-500 font-medium py-2" onClick={toggleMenu}>FAQ</Link>
                    {user.isAuthenticated ? (
                        <>
                            <hr className="border-pink-50" />
                            <div className="flex flex-col space-y-2">
                                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Signed in as {user.name}</span>
                                <button
                                    onClick={() => {
                                        import('../lib/firebase').then(({ auth }) => auth.signOut());
                                        toggleMenu();
                                    }}
                                    className="text-red-500 hover:text-red-600 font-medium text-left py-2"
                                >
                                    Sign Out
                                </button>
                            </div>
                        </>
                    ) : (
                        <>
                            <hr className="border-pink-50" />
                            <Link href="/login" className="text-gray-600 hover:text-pink-500 font-medium py-2" onClick={toggleMenu}>Log In</Link>
                            <button
                                onClick={() => {
                                    router.push('/signup');
                                    toggleMenu();
                                }}
                                className="bg-charcoal text-white px-5 py-3 rounded-xl text-sm font-bold hover:bg-black transition-all shadow-md w-full"
                            >
                                Get Started
                            </button>
                        </>
                    )}
                </div>
            )}
        </nav>
    );
}

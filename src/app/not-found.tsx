import Link from 'next/link';
import { ExternalLink } from 'lucide-react';

export default function NotFound() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <div className="text-center max-w-md bg-white p-8 rounded-3xl shadow-xl border border-gray-100">
                <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <ExternalLink size={32} className="rotate-180" />
                </div>
                <h1 className="text-2xl font-black text-gray-900 mb-2">Page Not Found</h1>
                <p className="text-gray-500 mb-6">We couldn&apos;t find the page you&apos;re looking for. It might have been moved or deleted.</p>
                <Link
                    href="/"
                    className="inline-flex items-center justify-center px-6 py-3 bg-charcoal text-white font-bold rounded-xl hover:bg-black transition-colors w-full"
                >
                    Go to Lacqr Home
                </Link>
            </div>
        </div>
    );
}

'use client';

import Link from 'next/link';

export default function BookPage() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4 text-center">
            <h1 className="text-2xl font-bold text-charcoal mb-4">Book an Appointment</h1>
            <p className="text-gray-600 mb-8">Please use the direct link provided by your salon or nail technician.</p>
            <Link href="/" className="bg-charcoal text-white px-6 py-3 rounded-xl font-bold hover:bg-black transition-colors">
                Return Home
            </Link>
        </div>
    );
}

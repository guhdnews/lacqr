'use client';

import BookingEditor from '@/components/booking/BookingEditor';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function BookingSettingsPage() {
    return (
        <div className="max-w-6xl mx-auto p-6">
            <div className="mb-8">
                <Link href="/dashboard/settings" className="text-gray-500 hover:text-gray-900 flex items-center gap-2 mb-4 transition-colors">
                    <ArrowLeft size={20} />
                    Back to Settings
                </Link>
                <h1 className="text-3xl font-black tracking-tight text-gray-900">Booking Page</h1>
                <p className="text-gray-500 mt-2">Customize how your clients see and book with you.</p>
            </div>

            <BookingEditor />
        </div>
    );
}

'use client';

import DraftsList from '@/components/DraftsList';
import { FileText } from 'lucide-react';

export default function Drafts() {
    return (
        <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-pink-100 rounded-xl flex items-center justify-center text-pink-500">
                    <FileText size={24} />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-charcoal font-display">Saved Drafts</h1>
                    <p className="text-gray-600">Manage your saved quotes and resume work.</p>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <DraftsList />
            </div>
        </div>
    );
}

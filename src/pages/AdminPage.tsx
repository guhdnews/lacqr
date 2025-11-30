import { useState } from 'react';
import { AIInspector } from '../components/admin/AIInspector';
import { PricingSandbox } from '../components/admin/PricingSandbox';
import { Database, Beaker } from 'lucide-react';

import { ReceiptBuilder } from '../components/admin/ReceiptBuilder';

export function AdminPage() {
    const [activeTab, setActiveTab] = useState<'inspector' | 'pricing' | 'training' | 'receipt'>('inspector');

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="bg-pink-600 text-white p-1.5 rounded-lg">
                            <Beaker className="w-5 h-5" />
                        </div>
                        <h1 className="text-xl font-bold text-gray-900 tracking-tight">Lacqr Logic Lab</h1>
                    </div>
                    <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
                        <button
                            onClick={() => setActiveTab('inspector')}
                            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === 'inspector' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            AI Inspector
                        </button>
                        <button
                            onClick={() => setActiveTab('pricing')}
                            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === 'pricing' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            Pricing Sandbox
                        </button>
                        <button
                            onClick={() => setActiveTab('receipt')}
                            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === 'receipt' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            Final Receipt
                        </button>
                        <button
                            onClick={() => setActiveTab('training')}
                            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === 'training' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            Training Data
                        </button>
                    </div>
                </div>
            </header>

            {/* Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {activeTab === 'inspector' && <AIInspector />}
                {activeTab === 'pricing' && <PricingSandbox />}
                {activeTab === 'receipt' && (
                    <ReceiptBuilder
                        initialSelection={{
                            base: { system: 'Gel X', length: 'Medium', shape: 'Almond', isFill: false },
                            art: { level: 'Level 1', price: 5 },
                            bling: { density: 'None', xlCharmsCount: 0 },
                            extras: []
                        }}
                        onSaveDraft={(selection) => console.log('Save Draft', selection)}
                        onAssignClient={() => console.log('Assign Client')}
                        onCreateClient={() => console.log('Create Client')}
                    />
                )}
                {activeTab === 'training' && (
                    <div className="text-center py-20">
                        <Database className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900">Training Data Collection</h3>
                        <p className="text-gray-500 max-w-md mx-auto mt-2">
                            This module will allow you to correct AI predictions and save them to a dataset for fine-tuning.
                            Coming soon.
                        </p>
                    </div>
                )}
            </main>
        </div>
    );
}

import React, { useState } from 'react';
import { Camera, Search, Menu, X, Upload } from 'lucide-react';

// Mock Data for QuoteCam Result
const MOCK_RESULT = {
    items: [
        { name: 'Gel-X Extension', price: 65 },
        { name: 'Almond Shape', price: 0 },
        { name: 'Chrome Powder (All)', price: 15 },
        { name: '3D Charms (x2)', price: 10 },
    ],
    total: 90,
    time: '1h 45m',
};

export default function UIMockup() {
    const [activeTab, setActiveTab] = useState('quote'); // 'quote' | 'sort'
    const [image, setImage] = useState<string | null>(null);
    const [result, setResult] = useState<typeof MOCK_RESULT | null>(null);

    // Mock "Scanning" process
    const handleUpload = () => {
        // In real app: Trigger file input
        setImage('https://via.placeholder.com/300x400?text=Nail+Inspo');
        setTimeout(() => {
            setResult(MOCK_RESULT);
        }, 1500);
    };

    return (
        <div className="flex flex-col h-screen bg-[#FCE4EC] font-sans text-[#212121]">
            {/* Header */}
            <header className="p-4 flex justify-between items-center bg-white/80 backdrop-blur-md sticky top-0 z-10">
                <h1 className="text-lg font-bold tracking-tight">Nail Tech Co-Pilot</h1>
                <button className="p-2 rounded-full hover:bg-gray-100">
                    <Menu size={24} />
                </button>
            </header>

            {/* Main Content Area */}
            <main className="flex-1 overflow-y-auto p-4 pb-24">
                {activeTab === 'quote' && (
                    <div className="space-y-6">
                        <div className="text-center space-y-2">
                            <h2 className="text-2xl font-semibold">QuoteCam</h2>
                            <p className="text-sm text-gray-600">Snap a pic, get the price.</p>
                        </div>

                        {/* Upload Area */}
                        {!image ? (
                            <div
                                onClick={handleUpload}
                                className="border-2 border-dashed border-gray-300 rounded-2xl h-64 flex flex-col items-center justify-center bg-white cursor-pointer hover:border-pink-300 transition-colors"
                            >
                                <div className="w-16 h-16 bg-pink-50 rounded-full flex items-center justify-center mb-4">
                                    <Camera size={32} className="text-pink-500" />
                                </div>
                                <span className="font-medium text-gray-500">Tap to Scan Design</span>
                            </div>
                        ) : (
                            <div className="relative rounded-2xl overflow-hidden shadow-lg">
                                <img src={image} alt="Uploaded" className="w-full h-64 object-cover" />
                                <button
                                    onClick={() => { setImage(null); setResult(null); }}
                                    className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded-full"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                        )}

                        {/* Results Card */}
                        {result && (
                            <div className="bg-white rounded-2xl p-6 shadow-xl animate-in slide-in-from-bottom-10 fade-in duration-500">
                                <div className="flex justify-between items-end mb-4 border-b border-gray-100 pb-4">
                                    <div>
                                        <p className="text-xs text-gray-400 uppercase tracking-wider font-bold">Estimated Total</p>
                                        <p className="text-3xl font-bold">${result.total}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-gray-400 uppercase tracking-wider font-bold">Time</p>
                                        <p className="font-medium">{result.time}</p>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    {result.items.map((item, i) => (
                                        <div key={i} className="flex justify-between text-sm">
                                            <span className="text-gray-600">{item.name}</span>
                                            <span className="font-medium">${item.price}</span>
                                        </div>
                                    ))}
                                </div>

                                <button className="w-full mt-6 bg-[#212121] text-white py-3 rounded-xl font-medium hover:bg-black transition-colors">
                                    Copy Receipt
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'sort' && (
                    <div className="flex flex-col items-center justify-center h-full text-center space-y-4 opacity-50">
                        <Search size={48} className="text-gray-300" />
                        <p>Service Sorter Coming Soon</p>
                    </div>
                )}
            </main>

            {/* Bottom Navigation */}
            <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-6 py-4 flex justify-around items-center pb-8">
                <button
                    onClick={() => setActiveTab('quote')}
                    className={`flex flex-col items-center space-y-1 ${activeTab === 'quote' ? 'text-pink-500' : 'text-gray-400'}`}
                >
                    <Camera size={24} />
                    <span className="text-[10px] font-medium uppercase tracking-wide">Quote</span>
                </button>

                <button
                    onClick={() => setActiveTab('sort')}
                    className={`flex flex-col items-center space-y-1 ${activeTab === 'sort' ? 'text-pink-500' : 'text-gray-400'}`}
                >
                    <Search size={24} />
                    <span className="text-[10px] font-medium uppercase tracking-wide">Sort</span>
                </button>
            </nav>
        </div>
    );
}

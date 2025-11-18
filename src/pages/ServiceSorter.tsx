import React, { useState } from 'react';
import { Sparkles, X, Copy, Check } from 'lucide-react';

// Mock Data for Service Sorter Result
const MOCK_RESULT = {
    services: ['Gel-X Extension', 'Level 2 Art', 'Chrome Add-on'],
    message: "Hey! To get this look, please book: Gel-X Extension + Level 2 Art + Chrome Add-on. Can't wait to see you! ✨",
};

export default function ServiceSorter() {
    const [image, setImage] = useState<string | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [result, setResult] = useState<typeof MOCK_RESULT | null>(null);
    const [copied, setCopied] = useState(false);

    const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImage(reader.result as string);
                simulateAnalysis();
            };
            reader.readAsDataURL(file);
        }
    };

    const simulateAnalysis = () => {
        setIsAnalyzing(true);
        setResult(null);
        setCopied(false);
        setTimeout(() => {
            setIsAnalyzing(false);
            setResult(MOCK_RESULT);
        }, 2000);
    };

    const reset = () => {
        setImage(null);
        setResult(null);
        setIsAnalyzing(false);
        setCopied(false);
    };

    const copyToClipboard = () => {
        if (result) {
            navigator.clipboard.writeText(result.message);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <div className="space-y-6 max-w-md mx-auto">
            <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold tracking-tight">Service Sorter</h2>
                <p className="text-sm text-gray-600">Upload inspo, get booking text.</p>
            </div>

            {/* Upload Area */}
            {!image ? (
                <label className="border-2 border-dashed border-gray-300 rounded-3xl h-80 flex flex-col items-center justify-center bg-white cursor-pointer hover:border-pink-300 hover:bg-pink-50/50 transition-all group relative overflow-hidden">
                    <input type="file" accept="image/*" onChange={handleUpload} className="hidden" />
                    <div className="w-20 h-20 bg-pink-50 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <Sparkles size={32} className="text-pink-500" />
                    </div>
                    <span className="font-medium text-gray-500 group-hover:text-pink-500 transition-colors">Tap to Analyze Inspo</span>
                    <p className="text-xs text-gray-400 mt-2">or upload from gallery</p>
                </label>
            ) : (
                <div className="relative rounded-3xl overflow-hidden shadow-lg bg-black">
                    <img src={image} alt="Uploaded" className={`w-full h-80 object-cover transition-opacity duration-500 ${isAnalyzing ? 'opacity-50' : 'opacity-100'}`} />

                    {!isAnalyzing && (
                        <button
                            onClick={reset}
                            className="absolute top-4 right-4 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 backdrop-blur-sm transition-colors"
                        >
                            <X size={20} />
                        </button>
                    )}

                    {/* Scanning Animation */}
                    {isAnalyzing && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                            <div className="w-12 h-12 border-4 border-white/30 border-t-pink-500 rounded-full animate-spin mb-4"></div>
                            <p className="font-medium animate-pulse">Matching Services...</p>
                        </div>
                    )}
                </div>
            )}

            {/* Results Card */}
            {result && (
                <div className="bg-white rounded-3xl p-6 shadow-xl animate-in slide-in-from-bottom-10 fade-in duration-500 border border-pink-100">
                    <div className="mb-6">
                        <p className="text-xs text-gray-400 uppercase tracking-wider font-bold mb-3">Detected Services</p>
                        <div className="flex flex-wrap gap-2">
                            {result.services.map((service, i) => (
                                <span key={i} className="bg-pink-50 text-pink-600 px-3 py-1 rounded-full text-sm font-medium">
                                    {service}
                                </span>
                            ))}
                        </div>
                    </div>

                    <div>
                        <p className="text-xs text-gray-400 uppercase tracking-wider font-bold mb-3">Client Message</p>
                        <div className="bg-gray-50 p-4 rounded-xl text-gray-700 text-sm leading-relaxed border border-gray-100 relative">
                            "{result.message}"
                        </div>
                    </div>

                    <button
                        onClick={copyToClipboard}
                        className={`w-full mt-6 py-4 rounded-xl font-medium transition-all shadow-lg hover:shadow-xl active:scale-95 flex items-center justify-center space-x-2 ${copied ? 'bg-green-500 text-white' : 'bg-charcoal text-white hover:bg-black'}`}
                    >
                        {copied ? (
                            <>
                                <Check size={20} />
                                <span>Copied!</span>
                            </>
                        ) : (
                            <>
                                <Copy size={20} />
                                <span>Copy Text</span>
                            </>
                        )}
                    </button>
                </div>
            )}
        </div>
    );
}

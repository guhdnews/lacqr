import React, { useState } from 'react';
import { Camera, X, DollarSign, Edit2, Check, AlertCircle } from 'lucide-react';
import { AI_SERVICE } from '../services/ai';
import type { QuoteAnalysis } from '../types/ai';

export default function QuoteCam() {
    const [image, setImage] = useState<string | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [result, setResult] = useState<QuoteAnalysis | null>(null);
    const [isEditing, setIsEditing] = useState(false);

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setImage(reader.result as string);
            reader.readAsDataURL(file);

            setIsAnalyzing(true);
            setResult(null);

            try {
                const analysis = await AI_SERVICE.analyzeImage(file);
                setResult(analysis);
            } catch (error) {
                console.error("Analysis failed", error);
            } finally {
                setIsAnalyzing(false);
            }
        }
    };

    const reset = () => {
        setImage(null);
        setResult(null);
        setIsAnalyzing(false);
        setIsEditing(false);
    };

    const handlePriceChange = (index: number, newPrice: string) => {
        if (!result) return;
        const updatedAddOns = [...result.add_ons];
        updatedAddOns[index].estimated_price = Number(newPrice) || 0;

        const newTotal = updatedAddOns.reduce((sum, item) => sum + (item.estimated_price || 0), 65); // Assuming base price 65
        setResult({ ...result, add_ons: updatedAddOns, total_estimated_price: newTotal });
    };

    const saveCorrection = () => {
        setIsEditing(false);
        console.log("Correction saved for training:", result);
    };

    return (
        <div className="space-y-6 max-w-md mx-auto">
            <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold tracking-tight">QuoteCam™</h2>
                <p className="text-sm text-gray-600">Snap a pic, get the price.</p>
            </div>

            {/* Upload Area */}
            {!image ? (
                <label className="border-2 border-dashed border-gray-300 rounded-3xl h-80 flex flex-col items-center justify-center bg-white cursor-pointer hover:border-pink-300 hover:bg-pink-50/50 transition-all group relative overflow-hidden">
                    <input type="file" accept="image/*" onChange={handleUpload} className="hidden" />
                    <div className="w-20 h-20 bg-pink-50 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <Camera size={32} className="text-pink-500" />
                    </div>
                    <span className="font-medium text-gray-500 group-hover:text-pink-500 transition-colors">Tap to Scan Design</span>
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
                            <p className="font-medium animate-pulse">Analyzing Cost Drivers...</p>
                        </div>
                    )}
                </div>
            )}

            {/* Results Card */}
            {result && (
                <div className="bg-white rounded-3xl p-6 shadow-xl animate-in slide-in-from-bottom-10 fade-in duration-500 border border-pink-100">
                    <div className="flex justify-between items-end mb-6 border-b border-gray-100 pb-6">
                        <div>
                            <p className="text-xs text-gray-400 uppercase tracking-wider font-bold mb-1">Estimated Total</p>
                            <div className="flex items-baseline text-pink-600">
                                <DollarSign size={24} className="self-center" />
                                <span className="text-4xl font-bold">{result.total_estimated_price}</span>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-xs text-gray-400 uppercase tracking-wider font-bold mb-1">Confidence</p>
                            <div className="flex items-center justify-end text-gray-700 font-medium">
                                <span className={`inline-block w-2 h-2 rounded-full mr-2 ${result.confidence_score > 0.8 ? 'bg-green-500' : 'bg-yellow-500'}`}></span>
                                {Math.round(result.confidence_score * 100)}%
                            </div>
                        </div>
                    </div>

                    {/* Detected Attributes */}
                    <div className="mb-6 bg-pink-50/50 p-4 rounded-xl border border-pink-100">
                        <h4 className="font-bold text-sm text-charcoal mb-3 flex items-center">
                            <AlertCircle size={16} className="mr-2 text-pink-500" />
                            Detected Attributes
                        </h4>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <span className="text-gray-500 block text-xs">Shape</span>
                                <span className="font-medium">{result.shape}</span>
                            </div>
                            <div>
                                <span className="text-gray-500 block text-xs">Length</span>
                                <span className="font-medium">{result.length}</span>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3 mb-6">
                        <p className="text-xs text-gray-400 uppercase tracking-wider font-bold">Itemized Costs</p>

                        {/* Base Service (Hardcoded for now based on mock) */}
                        <div className="flex justify-between text-sm group items-center">
                            <span className="text-gray-600">{result.base_service}</span>
                            <span className="font-medium text-gray-900">$65</span>
                        </div>

                        {result.add_ons.map((item, i) => (
                            <div key={i} className="flex justify-between text-sm group items-center">
                                <span className="text-gray-600 group-hover:text-charcoal transition-colors">
                                    {item.count && item.count > 1 ? `${item.count}x ` : ''}{item.name}
                                </span>
                                {isEditing ? (
                                    <div className="flex items-center">
                                        <span className="text-gray-400 mr-1">$</span>
                                        <input
                                            type="number"
                                            value={item.estimated_price}
                                            onChange={(e) => handlePriceChange(i, e.target.value)}
                                            className="w-16 border border-gray-200 rounded px-2 py-1 text-right font-medium focus:outline-none focus:border-pink-500"
                                        />
                                    </div>
                                ) : (
                                    <span className="font-medium text-gray-900">${item.estimated_price}</span>
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="flex space-x-3">
                        {isEditing ? (
                            <button
                                onClick={saveCorrection}
                                className="flex-1 bg-green-600 text-white py-4 rounded-xl font-medium hover:bg-green-700 transition-all shadow-lg flex items-center justify-center space-x-2"
                            >
                                <Check size={18} />
                                <span>Save Correction</span>
                            </button>
                        ) : (
                            <>
                                <button className="flex-1 bg-charcoal text-white py-4 rounded-xl font-medium hover:bg-black transition-all shadow-lg hover:shadow-xl active:scale-95">
                                    Copy Receipt
                                </button>
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="px-4 py-4 rounded-xl font-medium text-gray-500 hover:bg-gray-100 transition-colors border border-transparent hover:border-gray-200"
                                    title="Correct Price"
                                >
                                    <Edit2 size={20} />
                                </button>
                            </>
                        )}
                    </div>

                    {!isEditing && (
                        <p className="text-xs text-center text-gray-400 mt-4">
                            AI can make mistakes. Tap pencil to correct & train.
                        </p>
                    )}
                </div>
            )}
        </div>
    );
}

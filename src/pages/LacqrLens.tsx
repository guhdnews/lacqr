import React, { useState } from 'react';
import { Camera, X, DollarSign, AlertCircle, AlertTriangle, ZoomIn, ZoomOut, Check, Save, Download, Share2 } from 'lucide-react';
import { AI_SERVICE } from '../services/ai';
import { isImageBlurry, compressImage } from '../utils/imageProcessing';
import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import type { QuoteAnalysis } from '../types/ai';
import ScanningOverlay from '../components/ScanningOverlay';
import { useCooldown } from '../hooks/useCooldown';
import { generateReceipt } from '../utils/receiptGenerator';
import HelpModal from '../components/HelpModal';
import { HelpCircle } from 'lucide-react';
import { useServiceStore } from '../store/useServiceStore';
import { useAppStore } from '../store/useAppStore';
import type { Client } from '../types/client';
import { useEffect } from 'react';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';

export default function LacqrLens() {
    const { menu } = useServiceStore();
    const [image, setImage] = useState<string | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [result, setResult] = useState<QuoteAnalysis | null>(null);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [isBlurry, setIsBlurry] = useState(false);
    const [zoomLevel, setZoomLevel] = useState(1);
    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [viewMode, setViewMode] = useState<'estimate' | 'receipt'>('estimate');
    const [showHelp, setShowHelp] = useState(false);
    const [showFullImage, setShowFullImage] = useState(false);

    const { isCoolingDown, remainingTime, startCooldown } = useCooldown({
        cooldownTime: 10000, // 10 seconds cooldown between scans
        key: 'lacqr_lens_scan'
    });

    const [error, setError] = useState<string | null>(null);

    const { user } = useAppStore();
    const [clients, setClients] = useState<Client[]>([]);
    const [selectedClientId, setSelectedClientId] = useState<string>("");

    useEffect(() => {
        if (user && user.id) {
            const fetchClients = async () => {
                try {
                    const { collection, query, where, getDocs, orderBy } = await import('firebase/firestore');
                    const { db } = await import('../lib/firebase');
                    const q = query(
                        collection(db, 'clients'),
                        where('userId', '==', user.id),
                        orderBy('createdAt', 'desc')
                    );
                    const snapshot = await getDocs(q);
                    setClients(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Client)));
                } catch (error) {
                    console.error("Error fetching clients", error);
                }
            };
            fetchClients();
        }
    }, [user]);

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (isCoolingDown) {
            alert(`Please wait ${remainingTime}s before scanning again.`);
            return;
        }

        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = async () => {
                const imageSrc = reader.result as string;
                setImage(imageSrc);

                // Check for blur
                const blurry = await isImageBlurry(imageSrc);
                setIsBlurry(blurry);
            };
            reader.readAsDataURL(file);

            setIsAnalyzing(true);
            setResult(null);
            setSaveSuccess(false);
            setError(null);
            setViewMode('estimate');

            try {
                // Compress image before sending to AI
                const compressedFile = await compressImage(file);
                const analysis = await AI_SERVICE.analyzeImage(compressedFile, menu);
                setResult(analysis);
                startCooldown();
            } catch (error: any) {
                console.error("Analysis failed", error);
                setError(error.message || "An unexpected error occurred.");
            } finally {
                setIsAnalyzing(false);
            }
        }
    };

    const reset = () => {
        if (isAnalyzing) return;
        setImage(null);
        setResult(null);
        setIsAnalyzing(false);
        setEditingId(null);
        setIsBlurry(false);
        setZoomLevel(1);
        setSaveSuccess(false);
        setViewMode('estimate');
    };

    const toggleZoom = () => {
        setZoomLevel(prev => prev === 1 ? 2.5 : 1);
    };

    const updatePrice = (index: number, newPrice: number) => {
        if (!result) return;
        const updatedAddOns = [...result.breakdown.add_ons];
        updatedAddOns[index].estimated_price = newPrice;

        // Recalculate total
        const basePrice = result.breakdown.base_service.price;
        const addOnsTotal = updatedAddOns.reduce((sum, item) => sum + item.estimated_price, 0);

        setResult({
            ...result,
            breakdown: {
                ...result.breakdown,
                add_ons: updatedAddOns
            },
            total_estimated_price: basePrice + addOnsTotal
        });
        setEditingId(null);
    };

    const saveCorrection = async () => {
        if (!result || !image) return;
        setIsSaving(true);
        try {
            // Upload Image to Firebase Storage
            const { ref, uploadString, getDownloadURL } = await import('firebase/storage');
            const { storage } = await import('../lib/firebase');

            const filename = `training/${Date.now()}_${Math.random().toString(36).substring(7)}.jpg`;
            const storageRef = ref(storage, filename);

            // Upload base64 string
            await uploadString(storageRef, image, 'data_url');
            const imageUrl = await getDownloadURL(storageRef);

            await addDoc(collection(db, 'training_data'), {
                originalAnalysis: result,
                imageUrl: imageUrl, // Save the actual image URL
                timestamp: serverTimestamp(),
                deviceInfo: {
                    userAgent: navigator.userAgent,
                    screenSize: `${window.innerWidth}x${window.innerHeight}`
                },
                correctionType: ['user_edit']
            });

            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 3000);
        } catch (error) {
            console.error("Error saving correction:", error);
            alert("Failed to save correction. Please try again.");
        } finally {
            setIsSaving(false);
        }
    };

    const downloadReceipt = async () => {
        if (!result) return;
        try {
            const receiptUrl = await generateReceipt(result);
            const link = document.createElement('a');
            link.href = receiptUrl;
            link.download = `lacqr-receipt-${Date.now()}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error("Failed to generate receipt", error);
            alert("Could not generate receipt.");
        }
    };

    const shareQuote = async () => {
        if (!result) return;
        try {
            const { addDoc, collection } = await import('firebase/firestore');
            const { db } = await import('../lib/firebase');

            const quoteData = {
                type: 'lens',
                data: result,
                createdAt: new Date(),
                salonName: user?.name || "Your Salon",
                clientId: selectedClientId || null,
                clientName: selectedClientId ? clients.find(c => c.id === selectedClientId)?.name : null
            };

            const docRef = await addDoc(collection(db, 'quotes'), quoteData);

            // If a client is selected, update their history
            if (selectedClientId) {
                const clientRef = doc(db, 'clients', selectedClientId);
                await updateDoc(clientRef, {
                    lastVisit: new Date(),
                    history: arrayUnion({
                        id: docRef.id,
                        date: new Date(),
                        service: result.breakdown.base_service.name || "Nail Service",
                        price: result.total_estimated_price,
                        notes: "Generated via Lacqr Lens",
                        image: image // Optional: save image URL if available (might be too large for Firestore, better to use Storage URL if saved)
                    })
                });
            }

            const url = `${window.location.origin}/q/${docRef.id}`;
            await navigator.clipboard.writeText(url);
            alert("Link copied to clipboard! Send it to your client.");
        } catch (error) {
            console.error("Error sharing quote:", error);
            alert("Failed to create share link.");
        }
    };

    return (
        <div className="space-y-6 max-w-md mx-auto">
            <div className="text-center space-y-2 relative">
                <button
                    onClick={() => setShowHelp(true)}
                    className="absolute right-0 top-0 text-gray-400 hover:text-pink-500 transition-colors"
                >
                    <HelpCircle size={20} />
                </button>
                <h2 className="text-2xl font-bold tracking-tight">Lacqr Lens</h2>
                <p className="text-sm text-gray-600">Snap a pic, get the price.</p>
                {isCoolingDown && (
                    <p className="text-xs text-amber-600 font-medium animate-pulse">
                        Cooling down... {remainingTime}s
                    </p>
                )}
            </div>

            <HelpModal isOpen={showHelp} onClose={() => setShowHelp(false)} />

            {/* Error Message */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4 animate-in slide-in-from-top-2">
                    <div className="flex items-start">
                        <AlertCircle className="text-red-500 mt-0.5 mr-3 flex-shrink-0" size={20} />
                        <div className="flex-1">
                            <h3 className="text-sm font-bold text-red-800 mb-1">Analysis Failed</h3>
                            <p className="text-xs text-red-700 break-words mb-2">
                                {error.split(/(https?:\/\/[^\s]+)/g).map((part, i) =>
                                    part.match(/^https?:\/\//) ? (
                                        <a key={i} href={part} target="_blank" rel="noopener noreferrer" className="underline font-bold hover:text-red-900 break-all">
                                            {part}
                                        </a>
                                    ) : (
                                        part
                                    )
                                )}
                            </p>
                            <button
                                onClick={async () => {
                                    try {
                                        const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;
                                        const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID;
                                        const url = `https://firebaseml.googleapis.com/v2beta/projects/${projectId}/locations/us-central1/publishers/google/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

                                        const response = await fetch(url, {
                                            method: 'POST',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify({
                                                contents: [{ parts: [{ text: "Test" }] }]
                                            })
                                        });

                                        const data = await response.json();
                                        alert(`Diagnostic Result:\nStatus: ${response.status}\nResponse: ${JSON.stringify(data, null, 2)}`);
                                    } catch (e: any) {
                                        alert(`Diagnostic Failed: ${e.message}`);
                                    }
                                }}
                                className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded border border-red-200 hover:bg-red-200 font-bold"
                            >
                                Run Diagnostic Test
                            </button>
                        </div>
                        <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600 ml-2">
                            <X size={16} />
                        </button>
                    </div>
                </div>
            )}

            {/* Scanning Overlay */}
            <ScanningOverlay isVisible={isAnalyzing} />

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
                <div className="relative rounded-3xl overflow-hidden shadow-lg bg-black h-80 group">
                    <div
                        className="w-full h-full overflow-hidden cursor-zoom-in"
                        onClick={toggleZoom}
                    >
                        <img
                            src={image}
                            alt="Uploaded"
                            className={`w-full h-full object-contain bg-black transition-all duration-300 ${isAnalyzing ? 'opacity-50' : 'opacity-100'}`}
                            style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'center' }}
                        />
                    </div>

                    {/* Enlarge Button */}
                    {!isAnalyzing && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setShowFullImage(true);
                            }}
                            className="absolute top-4 left-4 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 backdrop-blur-sm transition-colors z-10"
                        >
                            <ZoomIn size={20} />
                        </button>
                    )}

                    {!isAnalyzing && (
                        <button
                            onClick={reset}
                            className="absolute top-4 right-4 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 backdrop-blur-sm transition-colors z-10"
                        >
                            <X size={20} />
                        </button>
                    )}

                    {/* Zoom Hint */}
                    {!isAnalyzing && (
                        <div className="absolute bottom-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-xs backdrop-blur-sm pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity flex items-center space-x-1">
                            {zoomLevel === 1 ? <ZoomIn size={12} /> : <ZoomOut size={12} />}
                            <span>{zoomLevel === 1 ? 'Tap to Zoom' : 'Tap to Reset'}</span>
                        </div>
                    )}

                    {/* Blurry Warning Overlay */}
                    {!isAnalyzing && isBlurry && (
                        <div className="absolute bottom-4 left-4 right-16 bg-yellow-500/90 backdrop-blur-md p-3 rounded-xl flex items-center text-white shadow-lg animate-in slide-in-from-bottom-2 pointer-events-none">
                            <AlertTriangle size={20} className="mr-3 flex-shrink-0" />
                            <p className="text-xs font-bold">Image appears blurry. Results may be less accurate.</p>
                        </div>
                    )}
                </div>
            )}

            {/* Results Card */}
            {result && (
                <div className="bg-white rounded-3xl p-6 shadow-xl animate-in slide-in-from-bottom-10 fade-in duration-500 border border-pink-100">
                    {/* Toggle Header */}
                    <div className="flex justify-center mb-6">
                        <div className="bg-gray-100 p-1 rounded-xl flex">
                            <button
                                onClick={() => setViewMode('estimate')}
                                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${viewMode === 'estimate' ? 'bg-white shadow-sm text-charcoal' : 'text-gray-400 hover:text-gray-600'}`}
                            >
                                Estimate
                            </button>
                            <button
                                onClick={() => setViewMode('receipt')}
                                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${viewMode === 'receipt' ? 'bg-white shadow-sm text-charcoal' : 'text-gray-400 hover:text-gray-600'}`}
                            >
                                Receipt
                            </button>
                        </div>
                    </div>

                    <div className="flex justify-between items-end mb-6 border-b border-gray-100 pb-6">
                        <div>
                            <p className="text-xs text-gray-400 uppercase tracking-wider font-bold mb-1">
                                {viewMode === 'estimate' ? 'Estimated Total' : 'Total Due'}
                            </p>
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
                            {result.reasoning.includes("DEMO MODE") && (
                                <span className="inline-block mt-1 px-2 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-bold rounded-full border border-amber-200">
                                    DEMO MODE
                                </span>
                            )}
                        </div>
                    </div>

                    {/* AI Analysis Description */}
                    {(result.visual_description || result.reasoning) && (
                        <div className="mb-6 bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                            <h4 className="font-bold text-sm text-indigo-900 mb-2 flex items-center">
                                <span className="mr-2 text-lg">✨</span>
                                AI Analysis
                            </h4>
                            <p className="text-sm text-indigo-800 leading-relaxed">
                                {result.visual_description || result.reasoning.split("AI Analysis:")[0]}
                            </p>
                        </div>
                    )}

                    {/* Detected Attributes with Visual Editors (Estimate Mode Only) */}
                    {viewMode === 'estimate' && (
                        <div className="mb-6 bg-pink-50/50 p-4 rounded-xl border border-pink-100">
                            <h4 className="font-bold text-sm text-charcoal mb-3 flex items-center">
                                <AlertCircle size={16} className="mr-2 text-pink-500" />
                                Detected Attributes
                            </h4>
                            <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                                <div className="bg-white p-3 rounded-lg border border-pink-100">
                                    <span className="text-gray-500 block text-xs mb-1">Shape</span>
                                    <select
                                        className="w-full bg-transparent font-bold text-charcoal focus:outline-none cursor-pointer"
                                        defaultValue={result.breakdown.shape}
                                    >
                                        {['Square', 'Coffin', 'Stiletto', 'Almond', 'Squoval', 'Oval'].map(s => (
                                            <option key={s} value={s}>{s}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="bg-white p-3 rounded-lg border border-pink-100">
                                    <span className="text-gray-500 block text-xs mb-1">Length</span>
                                    <select
                                        className="w-full bg-transparent font-bold text-charcoal focus:outline-none cursor-pointer"
                                        defaultValue={result.breakdown.length}
                                    >
                                        {['Short', 'Medium', 'Long', 'XL', 'XXL'].map(l => (
                                            <option key={l} value={l}>{l}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* New: Complexity and Colors */}
                            <div className="grid grid-cols-1 gap-4 text-sm">
                                <div className="bg-white p-3 rounded-lg border border-pink-100">
                                    <span className="text-gray-500 block text-xs mb-1">Complexity</span>
                                    <select
                                        className="w-full bg-transparent font-bold text-charcoal focus:outline-none cursor-pointer"
                                        defaultValue={result.breakdown.design_complexity || 'Moderate'}
                                    >
                                        {['Simple', 'Moderate', 'Intricate'].map(c => (
                                            <option key={c} value={c}>{c}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="bg-white p-3 rounded-lg border border-pink-100">
                                    <span className="text-gray-500 block text-xs mb-2">Detected Colors</span>
                                    <div className="flex flex-wrap gap-2">
                                        {result.breakdown.detected_colors?.map((color, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => {
                                                    const newColors = result.breakdown.detected_colors?.filter((_, i) => i !== idx);
                                                    setResult({
                                                        ...result,
                                                        breakdown: { ...result.breakdown, detected_colors: newColors }
                                                    });
                                                }}
                                                className="px-2 py-1 bg-gray-100 text-gray-600 rounded-md text-xs font-medium hover:bg-red-100 hover:text-red-500 flex items-center group"
                                            >
                                                {color}
                                                <X size={10} className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                                            </button>
                                        ))}
                                        <button
                                            onClick={() => {
                                                const color = prompt("Enter color name:");
                                                if (color) {
                                                    const newColors = [...(result.breakdown.detected_colors || []), color];
                                                    setResult({
                                                        ...result,
                                                        breakdown: { ...result.breakdown, detected_colors: newColors }
                                                    });
                                                }
                                            }}
                                            className="px-2 py-1 border border-dashed border-gray-300 text-gray-400 rounded-md text-xs hover:text-pink-500 hover:border-pink-300"
                                        >
                                            + Add
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="space-y-3 mb-6">
                        <p className="text-xs text-gray-400 uppercase tracking-wider font-bold">Itemized Costs</p>

                        {/* Base Service */}
                        <div className="flex justify-between items-center py-3 border-b border-gray-100">
                            <div>
                                <p className="font-bold text-charcoal">{result.breakdown.base_service.name}</p>
                                <p className="text-xs text-gray-400">Base Price</p>
                            </div>
                            <span className="font-bold">${result.breakdown.base_service.price}</span>
                        </div>

                        {/* Add-ons */}
                        {result.breakdown.add_ons.map((addon, i: number) => (
                            <div key={i} className="flex justify-between items-center py-3 border-b border-gray-100 last:border-0 group">
                                <div>
                                    <div className="flex items-center space-x-2">
                                        <p className="font-medium text-gray-700">{addon.name}</p>
                                        {addon.count > 1 && (
                                            <span className="bg-gray-100 text-gray-500 text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                                                x{addon.count}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-xs text-gray-400 capitalize">{addon.type}</p>
                                </div>
                                <div className="flex items-center space-x-3">
                                    {viewMode === 'estimate' && editingId === i ? (
                                        <div className="flex items-center space-x-2">
                                            <span className="text-gray-400 text-sm">$</span>
                                            <input
                                                type="number"
                                                className="w-16 bg-gray-50 border border-gray-200 rounded px-2 py-1 text-right font-bold focus:outline-none focus:border-pink-500"
                                                defaultValue={addon.estimated_price}
                                                onBlur={(e) => updatePrice(i, Number(e.target.value))}
                                                autoFocus
                                            />
                                        </div>
                                    ) : (
                                        <div className="flex items-center">
                                            <button
                                                onClick={() => viewMode === 'estimate' && setEditingId(i)}
                                                className={`font-bold transition-colors ${viewMode === 'estimate' ? 'hover:text-pink-500' : 'cursor-default'}`}
                                            >
                                                ${addon.estimated_price}
                                            </button>
                                            {viewMode === 'estimate' && (
                                                <button
                                                    onClick={() => {
                                                        const updatedAddOns = result.breakdown.add_ons.filter((_, idx) => idx !== i);
                                                        setResult({
                                                            ...result,
                                                            breakdown: { ...result.breakdown, add_ons: updatedAddOns },
                                                            total_estimated_price: result.breakdown.base_service.price + updatedAddOns.reduce((sum, item) => sum + item.estimated_price, 0)
                                                        });
                                                    }}
                                                    className="ml-2 text-gray-300 hover:text-red-500 transition-colors"
                                                >
                                                    <X size={14} />
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}

                        {/* Action Buttons (Estimate Mode Only) */}
                        {viewMode === 'estimate' && (
                            <div className="flex space-x-3 mt-4">
                                <button
                                    onClick={() => {
                                        const newAddOn = {
                                            name: "New Item",
                                            type: "custom" as const,
                                            count: 1,
                                            estimated_price: 0,
                                            confidence: 1
                                        };
                                        const updatedAddOns = [...result.breakdown.add_ons, newAddOn];
                                        setResult({
                                            ...result,
                                            breakdown: {
                                                ...result.breakdown,
                                                add_ons: updatedAddOns
                                            },
                                            total_estimated_price: result.breakdown.base_service.price + updatedAddOns.reduce((sum, item) => sum + item.estimated_price, 0)
                                        });
                                        setEditingId(updatedAddOns.length - 1);
                                    }}
                                    className="flex-1 py-3 border-2 border-dashed border-gray-200 rounded-xl text-gray-400 text-sm font-bold hover:border-pink-300 hover:text-pink-500 transition-all flex items-center justify-center"
                                >
                                    + Add Item
                                </button>
                                <button
                                    onClick={() => {
                                        const newDiscount = {
                                            name: "Discount",
                                            type: "custom" as const,
                                            count: 1,
                                            estimated_price: -5,
                                            confidence: 1
                                        };
                                        const updatedAddOns = [...result.breakdown.add_ons, newDiscount];
                                        setResult({
                                            ...result,
                                            breakdown: {
                                                ...result.breakdown,
                                                add_ons: updatedAddOns
                                            },
                                            total_estimated_price: result.breakdown.base_service.price + updatedAddOns.reduce((sum, item) => sum + item.estimated_price, 0)
                                        });
                                        setEditingId(updatedAddOns.length - 1);
                                    }}
                                    className="flex-1 py-3 border-2 border-dashed border-gray-200 rounded-xl text-gray-400 text-sm font-bold hover:border-green-300 hover:text-green-500 transition-all flex items-center justify-center"
                                >
                                    - Add Discount
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Client Selection */}
                    <div className="mb-6">
                        <p className="text-xs text-gray-400 uppercase tracking-wider font-bold mb-2">Link to Client (Optional)</p>
                        <select
                            value={selectedClientId}
                            onChange={(e) => setSelectedClientId(e.target.value)}
                            className="w-full p-3 bg-gray-50 rounded-xl border border-gray-100 text-sm font-medium text-charcoal focus:outline-none focus:border-pink-300"
                        >
                            <option value="">Select a client...</option>
                            {clients.map(client => (
                                <option key={client.id} value={client.id}>{client.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex space-x-3">
                        {viewMode === 'estimate' ? (
                            <button
                                onClick={saveCorrection}
                                disabled={isSaving}
                                className={`flex-1 py-4 rounded-xl font-bold text-white shadow-lg transition-all flex items-center justify-center space-x-2 ${saveSuccess ? 'bg-green-500' : 'bg-charcoal hover:bg-black'
                                    }`}
                            >
                                {saveSuccess ? (
                                    <>
                                        <Check size={20} />
                                        <span>Saved!</span>
                                    </>
                                ) : (
                                    <>
                                        <Save size={20} />
                                        <span>{isSaving ? 'Saving...' : 'Confirm'}</span>
                                    </>
                                )}
                            </button>
                        ) : (
                            <>
                                <button
                                    onClick={downloadReceipt}
                                    className="flex-1 py-4 rounded-xl font-bold text-white shadow-lg transition-all flex items-center justify-center space-x-2 bg-pink-500 hover:bg-pink-600"
                                >
                                    <Download size={20} />
                                    <span>Download Receipt</span>
                                </button>
                                <button
                                    onClick={shareQuote}
                                    className="p-4 rounded-xl font-bold text-gray-500 shadow-lg transition-all flex items-center justify-center bg-white hover:text-pink-500"
                                >
                                    <Share2 size={20} />
                                </button>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* Full Image Modal */}
            {showFullImage && image && (
                <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={() => setShowFullImage(false)}>
                    <button
                        onClick={() => setShowFullImage(false)}
                        className="absolute top-4 right-4 text-white hover:text-gray-300"
                    >
                        <X size={32} />
                    </button>
                    <img
                        src={image}
                        alt="Full size"
                        className="max-w-full max-h-full object-contain rounded-lg"
                        onClick={(e) => e.stopPropagation()}
                    />
                </div>
            )}
        </div>
    );
}

import React, { useState } from 'react';
import { Sparkles, X, Copy, Check, Clock, MessageCircle, ZoomIn, ZoomOut, AlertCircle, HelpCircle, Share2 } from 'lucide-react';
import { AI_SERVICE } from '../services/ai';
import type { ServiceRecommendation } from '../types/ai';
import ScanningOverlay from '../components/ScanningOverlay';
import HelpModal from '../components/HelpModal';
import { useCooldown } from '../hooks/useCooldown';
import { useServiceStore } from '../store/useServiceStore';
import { useAppStore } from '../store/useAppStore';
import type { Client } from '../types/client';
import { useEffect } from 'react';

export default function SmartQuote() {
    const { menu } = useServiceStore();
    const [image, setImage] = useState<string | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [result, setResult] = useState<ServiceRecommendation | null>(null);
    const [copied, setCopied] = useState(false);
    const [zoomLevel, setZoomLevel] = useState(1);
    const [showFullImage, setShowFullImage] = useState(false);
    const [editableReply, setEditableReply] = useState("");
    const [showHelp, setShowHelp] = useState(false);

    const { isCoolingDown, remainingTime, startCooldown } = useCooldown({
        cooldownTime: 10000, // 10 seconds cooldown
        key: 'smart_quote_scan'
    });

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (isCoolingDown) {
            alert(`Please wait ${remainingTime}s before scanning again.`);
            return;
        }

        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setImage(reader.result as string);
            reader.readAsDataURL(file);

            setIsAnalyzing(true);
            setResult(null);
            setCopied(false);
            setZoomLevel(1);

            try {
                const recommendation = await AI_SERVICE.recommendService(file, undefined, menu);
                setResult(recommendation);
                setEditableReply(recommendation.draft_reply);
                startCooldown();
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
        setCopied(false);
        setZoomLevel(1);
    };

    const toggleZoom = () => {
        setZoomLevel(prev => prev === 1 ? 2.5 : 1);
    };

    const copyToClipboard = () => {
        if (editableReply) {
            navigator.clipboard.writeText(editableReply);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

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

    const shareQuote = async () => {
        if (!result) return;
        try {
            const { addDoc, collection, doc, updateDoc, arrayUnion } = await import('firebase/firestore');
            const { db } = await import('../lib/firebase');

            const quoteData = {
                type: 'smart_quote',
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
                        service: "Smart Quote Analysis",
                        price: 0, // Estimates don't have a final price yet, maybe update later
                        notes: "Generated via Smart Quote"
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
                <h2 className="text-2xl font-bold tracking-tight">Smart Quote</h2>
                <p className="text-sm text-gray-600">Upload inspo, get booking text.</p>
                {isCoolingDown && (
                    <p className="text-xs text-amber-600 font-medium animate-pulse">
                        Cooling down... {remainingTime}s
                    </p>
                )}
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

                    {/* Scanning Overlay */}
                    <ScanningOverlay isVisible={isAnalyzing} />
                </div>
            )}

            {/* Results Card */}
            {result && (
                <div className="bg-white rounded-3xl p-6 shadow-xl animate-in slide-in-from-bottom-10 fade-in duration-500 border border-pink-100">

                    {/* Booking Codes */}
                    <div className="mb-6">
                        <p className="text-xs text-gray-400 uppercase tracking-wider font-bold mb-3">Required Booking Codes</p>
                        <div className="flex flex-wrap gap-2">
                            {result.booking_codes.map((code, i: number) => (
                                <span key={i} className="bg-pink-50 text-pink-600 px-3 py-1 rounded-full text-sm font-bold border border-pink-100">
                                    {code}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Reasoning & Time */}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="bg-gray-50 p-3 rounded-xl">
                            <div className="flex items-center text-gray-400 mb-1">
                                <Clock size={14} className="mr-1" />
                                <span className="text-xs font-bold uppercase">Est. Time</span>
                            </div>
                            <span className="font-medium text-charcoal">{Math.floor(result.estimated_duration_minutes / 60)}h {result.estimated_duration_minutes % 60}m</span>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-xl">
                            <div className="flex items-center text-gray-400 mb-1">
                                <Sparkles size={14} className="mr-1" />
                                <span className="text-xs font-bold uppercase">Upsell</span>
                            </div>
                            <span className="text-xs text-charcoal leading-tight block">{result.upsell_suggestion || "None"}</span>
                        </div>
                    </div>

                    {/* AI Analysis (Reasoning) */}
                    {result.reasoning && (
                        <div className="mb-6 bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                            <h4 className="font-bold text-sm text-indigo-900 mb-2 flex items-center">
                                <AlertCircle size={16} className="mr-2 text-indigo-500" />
                                AI Logic
                            </h4>
                            <p className="text-xs text-indigo-800 leading-relaxed">
                                {result.reasoning}
                            </p>
                        </div>
                    )}

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

                    {/* Editable Draft Reply */}
                    <div>
                        <div className="flex justify-between items-center mb-3">
                            <p className="text-xs text-gray-400 uppercase tracking-wider font-bold">Draft Reply</p>
                            <span className="text-xs text-pink-500 font-medium">Editable</span>
                        </div>
                        <div className="relative">
                            <textarea
                                value={editableReply}
                                onChange={(e) => setEditableReply(e.target.value)}
                                className="w-full bg-gray-50 p-4 rounded-xl text-gray-700 text-sm leading-relaxed border border-gray-100 focus:outline-none focus:border-pink-300 focus:ring-2 focus:ring-pink-100 transition-all min-h-[100px] resize-none"
                            />
                            <MessageCircle size={16} className="absolute top-4 right-4 text-gray-300 pointer-events-none" />
                        </div>
                    </div>

                    <div className="flex space-x-3 mt-6">
                        <button
                            onClick={copyToClipboard}
                            className={`flex-1 py-4 rounded-xl font-medium transition-all shadow-lg hover:shadow-xl active:scale-95 flex items-center justify-center space-x-2 ${copied ? 'bg-green-500 text-white' : 'bg-charcoal text-white hover:bg-black'}`}
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
                        <button
                            onClick={shareQuote}
                            className="p-4 rounded-xl font-bold text-gray-500 shadow-lg transition-all flex items-center justify-center bg-white hover:text-pink-500"
                        >
                            <Share2 size={20} />
                        </button>
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
            {/* Help Modal */}
            <HelpModal isOpen={showHelp} onClose={() => setShowHelp(false)} />
        </div>
    );
}

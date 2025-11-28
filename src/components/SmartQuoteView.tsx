import React, { useState } from 'react';
import { Sparkles, X, Copy, Check, ZoomIn, ZoomOut, HelpCircle, Share2, ThumbsUp, ThumbsDown, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AI_SERVICE } from '../services/ai';
import { compressImage } from '../utils/imageProcessing';
import type { ServiceSelection } from '../types/serviceSchema';
import ScanningOverlay from '../components/ScanningOverlay';
import HelpModal from '../components/HelpModal';
import { useCooldown } from '../hooks/useCooldown';
import type { Client } from '../types/client';
import ServiceConfigurator from '../components/ServiceConfigurator';
import { calculatePrice } from '../utils/pricingCalculator';
import FeedbackModal from '../components/FeedbackModal';
import type { MasterServiceMenu } from '../types/serviceSchema';

interface SmartQuoteViewProps {
    menu: MasterServiceMenu;
    clients?: Client[];
    onShareQuote?: (result: ServiceSelection, clientId: string) => Promise<void>;
    onQuoteGenerated?: (result: ServiceSelection) => void;
    isAuthenticated?: boolean;
}

export default function SmartQuoteView({
    menu,
    clients = [],
    onShareQuote,
    onQuoteGenerated,
    isAuthenticated = false
}: SmartQuoteViewProps) {
    const [image, setImage] = useState<string | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [result, setResult] = useState<ServiceSelection | null>(null);
    const [copied, setCopied] = useState(false);
    const [zoomLevel, setZoomLevel] = useState(1);
    const [showFullImage, setShowFullImage] = useState(false);
    const [showHelp, setShowHelp] = useState(false);
    const [editableReply, setEditableReply] = useState("");
    const [selectedClientId, setSelectedClientId] = useState<string>("");

    // Feedback Modal State
    const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);

    const { isCoolingDown, remainingTime, startCooldown } = useCooldown({
        cooldownTime: 10000, // 10 seconds cooldown
        key: 'smart_quote_scan'
    });

    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];

        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }

        if (isCoolingDown) {
            alert(`Please wait ${remainingTime}s before scanning again.`);
            return;
        }

        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setImage(reader.result as string);
            reader.readAsDataURL(file);

            setIsAnalyzing(true);
            setResult(null);
            setCopied(false);
            setZoomLevel(1);

            try {
                const compressedFile = await compressImage(file);
                // Use the same analysis as Lacqr Lens
                const analysis = await AI_SERVICE.analyzeImage(compressedFile);
                setResult(analysis);

                if (onQuoteGenerated) {
                    onQuoteGenerated(analysis);
                }

                // Generate a simple draft reply based on the analysis
                const price = calculatePrice(analysis, menu);
                const reply = `Hey! Thanks for sending the inspo. Based on this design, I'd quote this as a ${analysis.base.length} ${analysis.base.shape} ${analysis.base.system} set with ${analysis.art.level || 'no'} art. The estimated total would be around $${price.total.toFixed(2)}. Let me know if you'd like to book!`;
                setEditableReply(reply);

                startCooldown();
            } catch (error) {
                console.error("Analysis failed", error);
                alert("Analysis failed. Please try again.");
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

    const handleShare = async () => {
        if (onShareQuote && result) {
            await onShareQuote(result, selectedClientId);
        }
    };

    return (
        <div className="space-y-6 max-w-md mx-auto">
            <div className="text-center space-y-2 relative">
                <div className="absolute right-0 top-0 flex space-x-2">
                    {isAuthenticated && (
                        <Link to="/smart-quote/settings" className="text-gray-400 hover:text-pink-500 transition-colors">
                            <Settings size={20} />
                        </Link>
                    )}
                    <button
                        onClick={() => setShowHelp(true)}
                        className="text-gray-400 hover:text-pink-500 transition-colors"
                    >
                        <HelpCircle size={20} />
                    </button>
                </div>
                <h2 className="text-2xl font-bold tracking-tight">Service Sorter</h2>
                <p className="text-sm text-gray-600">Upload inspo, get service recommendations.</p>
                {isCoolingDown && (
                    <p className="text-xs text-amber-600 font-medium animate-pulse">
                        Cooling down... {remainingTime}s
                    </p>
                )}
            </div>

            {/* Upload Area */}
            {!image ? (
                <label className="border-2 border-dashed border-gray-300 rounded-3xl h-80 flex flex-col items-center justify-center bg-white cursor-pointer hover:border-pink-300 hover:bg-pink-50/50 transition-all group relative overflow-hidden">
                    <input ref={fileInputRef} type="file" accept="image/*" onChange={handleUpload} className="hidden" />
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
                    <ScanningOverlay
                        isVisible={isAnalyzing}
                        onCancel={() => {
                            setIsAnalyzing(false);
                        }}
                    />
                </div>
            )}

            {/* Results Card */}
            {result && (
                <div className="space-y-6 animate-in slide-in-from-bottom-10 fade-in duration-500">

                    {/* Visual Description Card */}
                    {result.visual_description && (
                        <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-xl relative">
                            <h4 className="text-xs font-bold text-indigo-800 uppercase tracking-wider mb-2">AI Visual Analysis</h4>
                            <p className="text-sm text-indigo-900 italic mb-3">"{result.visual_description}"</p>

                            {/* Feedback Buttons */}
                            <div className="flex justify-end gap-2">
                                <button
                                    onClick={() => setFeedbackModalOpen(true)}
                                    className="p-1.5 rounded-lg hover:bg-indigo-100 text-indigo-400 hover:text-indigo-600 transition-colors"
                                    title="Good analysis"
                                >
                                    <ThumbsUp size={16} />
                                </button>
                                <button
                                    onClick={() => setFeedbackModalOpen(true)}
                                    className="p-1.5 rounded-lg hover:bg-indigo-100 text-indigo-400 hover:text-indigo-600 transition-colors"
                                    title="Bad analysis"
                                >
                                    <ThumbsDown size={16} />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Service Configurator */}
                    <ServiceConfigurator
                        initialSelection={result}
                        onUpdate={(updatedSelection) => setResult(updatedSelection)}
                    />

                    {/* Client Selection (Only if authenticated and clients exist) */}
                    {isAuthenticated && clients.length > 0 && (
                        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
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
                    )}

                    {/* Editable Draft Reply */}
                    <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                        <div className="flex justify-between items-center mb-3">
                            <p className="text-xs text-gray-400 uppercase tracking-wider font-bold">Draft Reply</p>
                            <span className="text-xs text-pink-500 font-medium">Editable</span>
                        </div>
                        <textarea
                            value={editableReply}
                            onChange={(e) => setEditableReply(e.target.value)}
                            className="w-full bg-gray-50 p-4 rounded-xl text-gray-700 text-sm leading-relaxed border border-gray-100 focus:outline-none focus:border-pink-300 focus:ring-2 focus:ring-pink-100 transition-all min-h-[100px] resize-none"
                        />
                    </div>

                    <div className="flex space-x-3">
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

                        {/* Only show Share button if authenticated */}
                        {isAuthenticated && (
                            <button
                                onClick={handleShare}
                                className="p-4 rounded-xl font-bold text-gray-500 shadow-lg transition-all flex items-center justify-center bg-white hover:text-pink-500"
                            >
                                <Share2 size={20} />
                            </button>
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
            {/* Help Modal */}
            <HelpModal isOpen={showHelp} onClose={() => setShowHelp(false)} context="smart_quote" />

            {/* Feedback Modal */}
            <FeedbackModal
                isOpen={feedbackModalOpen}
                onClose={() => setFeedbackModalOpen(false)}
                context="smart_quote"
                aiResult={result}
            />
        </div>
    );
}

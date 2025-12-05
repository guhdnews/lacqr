/* eslint-disable @next/next/no-img-element */
import React, { useState } from 'react';
import { Sparkles, X, Copy, Check, ZoomIn, ZoomOut, HelpCircle, Share2, ThumbsUp, ThumbsDown, Settings, Edit3 } from 'lucide-react';
import Link from 'next/link';
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
    themeColor?: string;
    buttonStyle?: 'rounded' | 'pill' | 'square';
    onBook?: (quote: ServiceSelection, clientDetails: { name: string; phone: string; instagram?: string; notes?: string }) => Promise<void>;
}

export default function SmartQuoteView({
    menu,
    clients = [],
    onShareQuote,
    onQuoteGenerated,
    isAuthenticated = false,
    themeColor = '#ec4899',
    buttonStyle = 'rounded',
    onBook
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

    // Booking Modal State
    const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
    const [bookingStep, setBookingStep] = useState<'form' | 'success'>('form');
    const [clientDetails, setClientDetails] = useState({ name: '', phone: '', instagram: '', notes: '' });
    const [isBooking, setIsBooking] = useState(false);
    const [policyAgreed, setPolicyAgreed] = useState(false);


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

    // Default selection for manual booking
    const DEFAULT_SELECTION: ServiceSelection = {
        base: { system: 'Acrylic', shape: 'Square', length: 'Short' },
        addons: { finish: 'Glossy', specialtyEffect: 'None', classicDesign: 'None' },
        art: { level: null },
        bling: { density: 'None', xlCharmsCount: 0, piercingsCount: 0 },
        modifiers: { foreignWork: 'None', repairsCount: 0, soakOffOnly: false },
        pedicure: { type: 'None', toeArtMatch: false }
    };

    return (
        <div className="flex flex-col max-w-2xl mx-auto relative bg-white rounded-[2.5rem] shadow-xl overflow-hidden border-4 border-pink-100 my-4 transition-all duration-500 pb-8">

            {/* Header */}
            <div className="p-6 z-10 space-y-6 bg-gradient-to-b from-pink-50 to-white">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        {isAuthenticated && (
                            <Link href="/dashboard/settings" className="p-2 bg-white border border-pink-100 rounded-full text-gray-500 hover:text-pink-600 hover:border-pink-300 transition-all shadow-sm">
                                <Settings size={20} />
                            </Link>
                        )}
                    </div>
                    <h2 className="text-pink-900 font-bold text-lg tracking-wide">Smart Quote</h2>
                    <button onClick={() => setShowHelp(true)} className="p-2 bg-white border border-pink-100 rounded-full text-gray-500 hover:text-pink-600 hover:border-pink-300 transition-all shadow-sm">
                        <HelpCircle size={20} />
                    </button>
                </div>

                <div className="text-center px-4">
                    <p className="text-gray-500 text-sm font-medium">Upload inspo, get service recommendations.</p>
                    {isCoolingDown && (
                        <p className="text-xs text-amber-600 font-medium animate-pulse mt-2">
                            Cooling down... {remainingTime}s
                        </p>
                    )}
                </div>
            </div>

            {/* Manual Build Button */}
            {!image && !result && (
                <div className="px-6 pb-2">
                    <button
                        onClick={() => {
                            setResult(DEFAULT_SELECTION);
                        }}
                        className="w-full py-3 bg-white border-2 border-pink-100 text-pink-600 font-bold rounded-xl hover:bg-pink-50 transition-colors flex items-center justify-center gap-2"
                    >
                        <Edit3 size={18} />
                        Book Manually
                    </button>
                </div>
            )}

            {/* Camera Viewfinder / Upload Area */}
            {!result && (
                <div className="relative mx-4 mb-4 rounded-3xl overflow-hidden bg-gray-50 border-2 border-dashed border-pink-200 group min-h-[400px]">

                    {/* Image Display */}
                    {image && (
                        <img
                            src={image}
                            alt="Captured"
                            className={`w-full h-full object-cover absolute inset-0 transition-opacity duration-500 ${isAnalyzing ? 'opacity-50 blur-sm' : 'opacity-100'}`}
                            style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'center', transition: 'transform 0.3s ease-out' }}
                        />
                    )}

                    {/* Scanning Overlay */}
                    {(isAnalyzing || (!image && !result)) && (
                        <div className={`absolute inset-0 z-20 pointer-events-none ${!isAnalyzing && !image ? 'hidden' : ''}`}>
                            <ScanningOverlay isScanning={isAnalyzing} mode="design" />
                        </div>
                    )}

                    {/* Empty State: Tap to Scan Button */}
                    {!image && !result && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center z-30 pointer-events-none gap-8">
                            <div className="relative group pointer-events-auto">
                                <div className="absolute -inset-4 bg-gradient-to-r from-pink-200 to-purple-200 rounded-full blur-xl opacity-50 group-hover:opacity-75 transition duration-1000 group-hover:duration-200 animate-pulse"></div>
                                <label className="relative w-32 h-32 bg-white rounded-full flex flex-col items-center justify-center cursor-pointer hover:scale-105 transition-transform shadow-[0_8px_30px_rgb(0,0,0,0.12)] border-4 border-pink-50">
                                    <Sparkles size={40} className="text-pink-500 mb-2" />
                                    <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Tap to Scan</span>
                                    <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
                                </label>
                            </div>
                            <p className="text-xs text-gray-400">or upload from gallery</p>
                        </div>
                    )}

                    {/* Controls Overlay (Zoom, Fullscreen, Reset) */}
                    {image && !isAnalyzing && (
                        <div className="absolute inset-0 pointer-events-none">
                            {/* Top Right Controls */}
                            <div className="absolute top-4 right-4 flex flex-col gap-2 pointer-events-auto">
                                <button
                                    onClick={reset}
                                    className="p-2 bg-white/80 backdrop-blur-md rounded-full text-gray-700 hover:text-red-500 transition-all shadow-sm"
                                    title="Reset"
                                >
                                    <X size={20} />
                                </button>
                                <button
                                    onClick={() => setShowFullImage(true)}
                                    className="p-2 bg-white/80 backdrop-blur-md rounded-full text-gray-700 hover:text-blue-500 transition-all shadow-sm"
                                    title="Full Screen"
                                >
                                    <ZoomIn size={20} />
                                </button>
                            </div>

                            {/* Bottom Right Zoom Toggle */}
                            <div className="absolute bottom-4 right-4 pointer-events-auto">
                                <button
                                    onClick={toggleZoom}
                                    className="px-3 py-1.5 bg-black/50 backdrop-blur-md rounded-full text-white text-xs font-medium hover:bg-black/70 transition-all flex items-center gap-1"
                                >
                                    {zoomLevel === 1 ? <ZoomIn size={14} /> : <ZoomOut size={14} />}
                                    {zoomLevel === 1 ? 'Zoom In' : 'Reset Zoom'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}


            {/* Results Card */}
            {result && (
                <div className="space-y-6 animate-in slide-in-from-bottom-10 fade-in duration-500 px-4">

                    {/* Visual Description Card */}
                    {result.visual_description && (
                        <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-xl relative">
                            <h4 className="text-xs font-bold text-indigo-800 uppercase tracking-wider mb-2">AI Visual Analysis</h4>
                            <p className="text-sm text-indigo-900 italic mb-3">&quot;{result.visual_description}&quot;</p>

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
                    <div className="relative">
                        <ServiceConfigurator
                            initialSelection={result}
                            onUpdate={(selection) => {
                                setResult(selection);
                            }}
                        />

                        {/* Back Button for Manual Mode */}
                        {!image && (
                            <div className="mt-4 text-center">
                                <button
                                    onClick={reset}
                                    className="text-sm text-gray-500 hover:text-pink-500 underline"
                                >
                                    Start Over / Scan Image
                                </button>
                            </div>
                        )}
                    </div>

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

                    {/* Booking Button (Public Only) */}
                    {!isAuthenticated && onBook && (
                        <button
                            onClick={() => setIsBookingModalOpen(true)}
                            className={`w-full py-4 text-white font-bold shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all flex items-center justify-center gap-2 ${buttonStyle === 'pill' ? 'rounded-full' : buttonStyle === 'square' ? 'rounded-none' : 'rounded-xl'}`}
                            style={{ backgroundColor: themeColor }}
                        >
                            <Sparkles size={20} />
                            Request Appointment
                        </button>
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
                            className={`flex-1 py-4 font-medium transition-all shadow-lg hover:shadow-xl active:scale-95 flex items-center justify-center space-x-2 ${copied ? 'text-white' : 'text-white hover:opacity-90'} ${buttonStyle === 'pill' ? 'rounded-full' : buttonStyle === 'square' ? 'rounded-none' : 'rounded-xl'
                                }`}
                            style={{ backgroundColor: copied ? '#22c55e' : themeColor }}
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
                                className={`p-4 font-bold text-gray-500 shadow-lg transition-all flex items-center justify-center bg-white hover:text-pink-500 ${buttonStyle === 'pill' ? 'rounded-full' : buttonStyle === 'square' ? 'rounded-none' : 'rounded-xl'
                                    }`}
                            >
                                <Share2 size={20} />
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* Full Image Modal */}
            {showFullImage && image && (
                <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={() => setShowFullImage(false)}>
                    <button
                        onClick={() => setShowFullImage(false)}
                        className="absolute top-4 right-4 text-white/80 hover:text-white p-2"
                    >
                        <X size={32} />
                    </button>
                    <img
                        src={image}
                        alt="Full size"
                        className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    />
                    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/50 text-sm">
                        Tap anywhere to close
                    </div>
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

            {/* Booking Modal */}
            {isBookingModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="text-xl font-bold text-gray-900">
                                {bookingStep === 'form' ? 'Request Appointment' : 'Request Sent!'}
                            </h3>
                            <button onClick={() => setIsBookingModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <X size={24} />
                            </button>
                        </div>

                        {bookingStep === 'form' ? (
                            <div className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Name <span className="text-red-500">*</span></label>
                                    <input
                                        type="text"
                                        value={clientDetails.name}
                                        onChange={(e) => setClientDetails({ ...clientDetails, name: e.target.value })}
                                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-pink-500 focus:outline-none"
                                        placeholder="Your full name"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Phone <span className="text-red-500">*</span></label>
                                    <input
                                        type="tel"
                                        value={clientDetails.phone}
                                        onChange={(e) => setClientDetails({ ...clientDetails, phone: e.target.value })}
                                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-pink-500 focus:outline-none"
                                        placeholder="(555) 123-4567"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Instagram Handle (Optional)</label>
                                    <input
                                        type="text"
                                        value={clientDetails.instagram}
                                        onChange={(e) => setClientDetails({ ...clientDetails, instagram: e.target.value })}
                                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-pink-500 focus:outline-none"
                                        placeholder="@username"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Notes (Optional)</label>
                                    <textarea
                                        value={clientDetails.notes}
                                        onChange={(e) => setClientDetails({ ...clientDetails, notes: e.target.value })}
                                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-pink-500 focus:outline-none h-24 resize-none"
                                        placeholder="Any special requests or availability?"
                                    />
                                </div>

                                <div className="flex items-center gap-2 pt-2">
                                    <input
                                        type="checkbox"
                                        id="policy-agree"
                                        checked={policyAgreed}
                                        onChange={(e) => setPolicyAgreed(e.target.checked)}
                                        className="w-5 h-5 rounded border-gray-300 text-pink-500 focus:ring-pink-500"
                                    />
                                    <label htmlFor="policy-agree" className="text-sm text-gray-600">I agree to the salon policies.</label>
                                </div>

                                <button
                                    onClick={async () => {
                                        if (!clientDetails.name || !clientDetails.phone) {
                                            alert("Please fill in all required fields.");
                                            return;
                                        }
                                        if (!policyAgreed) {
                                            alert("Please agree to the salon policies to continue.");
                                            return;
                                        }
                                        setIsBooking(true);
                                        try {
                                            if (onBook && result) {
                                                await onBook(result, clientDetails);
                                                setBookingStep('success');
                                            }
                                        } catch (error) {
                                            console.error("Booking failed", error);
                                            alert("Something went wrong. Please try again.");
                                        } finally {
                                            setIsBooking(false);
                                        }
                                    }}
                                    disabled={isBooking}
                                    className="w-full py-4 bg-black text-white font-bold rounded-xl hover:bg-gray-900 transition-colors disabled:opacity-50 mt-4"
                                >
                                    {isBooking ? 'Sending Request...' : 'Send Request'}
                                </button>
                            </div>
                        ) : (
                            <div className="p-8 text-center space-y-4">
                                <div className="w-16 h-16 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Check size={32} />
                                </div>
                                <h4 className="text-2xl font-bold text-gray-900">You&apos;re on the list!</h4>
                                <p className="text-gray-500">
                                    Thanks for your request, {clientDetails.name}. We&apos;ve received your quote and will text you at {clientDetails.phone} shortly to confirm your appointment.
                                </p>
                                <button
                                    onClick={() => {
                                        setIsBookingModalOpen(false);
                                        setBookingStep('form');
                                        setClientDetails({ name: '', phone: '', instagram: '', notes: '' });
                                        reset();
                                    }}
                                    className="w-full py-3 bg-gray-100 text-gray-900 font-bold rounded-xl hover:bg-gray-200 transition-colors mt-6"
                                >
                                    Close
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

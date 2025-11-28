import React, { useState } from 'react';
import { Camera, X, AlertCircle, AlertTriangle, ZoomIn, ZoomOut, HelpCircle, ArrowRight, ArrowLeft, ThumbsUp, ThumbsDown } from 'lucide-react';
import { AI_SERVICE } from '../services/ai';
import { isImageBlurry, compressImage } from '../utils/imageProcessing';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { ServiceSelection } from '../types/serviceSchema';
import type { Client } from '../types/client';
import ScanningOverlay from '../components/ScanningOverlay';
import { useCooldown } from '../hooks/useCooldown';
import HelpModal from '../components/HelpModal';
import { useServiceStore } from '../store/useServiceStore';
import { useAppStore } from '../store/useAppStore';
import ServiceConfigurator from '../components/ServiceConfigurator';
import { calculatePrice } from '../utils/pricingCalculator';
import { ReceiptBuilder } from '../components/admin/ReceiptBuilder';
import ClientModal from '../components/ClientModal';
import FeedbackModal from '../components/FeedbackModal';

type LensStep = 'scan' | 'configure' | 'receipt';

export default function LacqrLens() {
    const { menu } = useServiceStore();
    const [image, setImage] = useState<string | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [result, setResult] = useState<ServiceSelection | null>(null);
    const [isBlurry, setIsBlurry] = useState(false);
    const [zoomLevel, setZoomLevel] = useState(1);
    const [showHelp, setShowHelp] = useState(false);
    const [showFullImage, setShowFullImage] = useState(false);
    const [step, setStep] = useState<LensStep>('scan');

    // Client Modal State
    const [clientModalOpen, setClientModalOpen] = useState(false);
    const [clientModalMode, setClientModalMode] = useState<'create' | 'assign'>('create');

    // Feedback Modal State
    const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);

    const { isCoolingDown, remainingTime, startCooldown } = useCooldown({
        cooldownTime: 10000, // 10 seconds cooldown between scans
        key: 'lacqr_lens_scan'
    });

    const [error, setError] = useState<string | null>(null);

    const { user } = useAppStore();

    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];

        // Always reset the input so the same file can be selected again
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }

        if (isCoolingDown) {
            alert(`Please wait ${remainingTime}s before scanning again.`);
            return;
        }

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
            setError(null);
            setStep('scan'); // Reset step

            try {
                // Compress image before sending to AI
                const compressedFile = await compressImage(file);
                const analysis = await AI_SERVICE.analyzeImage(compressedFile); // No longer passing menu, AI returns ServiceSelection
                setResult(analysis);
                setStep('configure'); // Move to configure step
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
        setIsBlurry(false);
        setZoomLevel(1);
        setStep('scan');
    };

    const toggleZoom = () => {
        setZoomLevel(prev => prev === 1 ? 2.5 : 1);
    };

    // --- Receipt Actions ---
    const handleSaveDraft = async (finalSelection: ServiceSelection) => {
        if (!user) {
            alert("Please log in to save drafts.");
            return;
        }

        try {
            const totalPrice = calculatePrice(finalSelection, menu);

            await addDoc(collection(db, 'quotes'), {
                type: 'draft',
                data: finalSelection,
                totalPrice: totalPrice,
                createdAt: new Date(),
                salonName: user.name || "Your Salon",
                userId: user.id,
                status: 'draft'
            });

            alert("Draft saved successfully!");
            reset(); // Go back to scan
        } catch (error) {
            console.error("Error saving draft:", error);
            alert("Failed to save draft.");
        }
    };

    const handleAssignClient = () => {
        setClientModalMode('assign');
        setClientModalOpen(true);
    };

    const handleCreateClient = () => {
        setClientModalMode('create');
        setClientModalOpen(true);
    };

    const handleClientSelected = async (client: Client) => {
        if (!result || !user) return;

        try {
            const totalPrice = calculatePrice(result, menu);
            await addDoc(collection(db, 'quotes'), {
                type: 'assigned',
                data: result,
                totalPrice: totalPrice,
                createdAt: new Date(),
                salonName: user.name || "Your Salon",
                userId: user.id,
                clientId: client.id,
                clientName: client.name,
                status: 'pending'
            });

            alert(`Quote saved for ${client.name}!`);
            reset();
        } catch (error) {
            console.error("Error saving quote:", error);
            alert("Failed to save quote.");
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
                            <p className="text-xs text-red-700 break-words mb-3">
                                {error}
                            </p>
                            <button
                                onClick={() => {
                                    setError(null);
                                    // Create a default empty selection
                                    setResult({
                                        base: { system: 'Acrylic', shape: 'Square', length: 'Short' },
                                        addons: { finish: 'Glossy', specialtyEffect: 'None', classicDesign: 'None' },
                                        art: { level: null },
                                        bling: { density: 'None', xlCharmsCount: 0, piercingsCount: 0 },
                                        modifiers: { foreignWork: 'None', repairsCount: 0, soakOffOnly: false },
                                        pedicure: { type: 'None', toeArtMatch: false },
                                        estimatedDuration: 0,
                                        aiDescription: "Manual Configuration"
                                    });
                                    setStep('configure');
                                }}
                                className="text-xs font-bold bg-red-100 text-red-700 px-3 py-2 rounded-lg hover:bg-red-200 transition-colors"
                            >
                                Configure Manually
                            </button>
                        </div>
                        <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600 ml-2">
                            <X size={16} />
                        </button>
                    </div>
                </div>
            )}

            {/* Scanning Overlay */}
            <ScanningOverlay
                isVisible={isAnalyzing}
                onCancel={() => {
                    setIsAnalyzing(false);
                    setError("Scan cancelled by user.");
                }}
            />

            {/* Upload Area (Only show in 'scan' or 'configure' step) */}
            {step !== 'receipt' && (
                !image ? (
                    <label className="border-2 border-dashed border-gray-300 rounded-3xl h-80 flex flex-col items-center justify-center bg-white cursor-pointer hover:border-pink-300 hover:bg-pink-50/50 transition-all group relative overflow-hidden">
                        <input type="file" ref={fileInputRef} accept="image/*" onChange={handleUpload} className="hidden" />
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
                )
            )}

            {/* STEP 2: Configuration */}
            {step === 'configure' && result && (
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

                    {/* Next Button */}
                    <button
                        onClick={() => setStep('receipt')}
                        className="w-full py-4 bg-gray-900 text-white rounded-xl font-bold hover:bg-black shadow-lg transition-all flex items-center justify-center gap-2"
                    >
                        <span>Generate Receipt</span>
                        <ArrowRight size={20} />
                    </button>
                </div>
            )}

            {/* STEP 3: Final Receipt */}
            {step === 'receipt' && result && (
                <div className="space-y-6 animate-in slide-in-from-right-10 fade-in duration-500">
                    <div className="flex items-center gap-2 mb-4">
                        <button
                            onClick={() => setStep('configure')}
                            className="text-gray-500 hover:text-gray-900 flex items-center gap-1 text-sm font-medium"
                        >
                            <ArrowLeft size={16} /> Back to Edit
                        </button>
                    </div>

                    <ReceiptBuilder
                        initialSelection={result}
                        onSaveDraft={handleSaveDraft}
                        onAssignClient={handleAssignClient}
                        onCreateClient={handleCreateClient}
                    />
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

            {/* Client Modal */}
            <ClientModal
                isOpen={clientModalOpen}
                mode={clientModalMode}
                onClose={() => setClientModalOpen(false)}
                onClientSelected={handleClientSelected}
            />

            {/* Feedback Modal */}
            <FeedbackModal
                isOpen={feedbackModalOpen}
                onClose={() => setFeedbackModalOpen(false)}
                context="lacqr_lens"
                aiResult={result}
            />
        </div>
    );
}

/* eslint-disable @next/next/no-img-element */
'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Camera, X, AlertCircle, AlertTriangle, ZoomIn, ZoomOut, HelpCircle, ArrowRight, ArrowLeft, ThumbsUp, ThumbsDown, History, RefreshCw, Scan, Sparkles, CheckCircle2, BrainCircuit } from 'lucide-react';
import { AI_SERVICE } from '@/services/ai';
import { isImageBlurry, compressImage } from '@/utils/imageProcessing';
import { collection, addDoc, doc, getDoc, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { ServiceSelection } from '@/types/serviceSchema';
import type { Client } from '@/types/client';
import ScanningOverlay from '@/components/ScanningOverlay';
import { useCooldown } from '@/hooks/useCooldown';
import HelpModal from '@/components/HelpModal';
import { useServiceStore } from '@/store/useServiceStore';
import { useAppStore } from '@/store/useAppStore';
import ServiceConfigurator from '@/components/ServiceConfigurator';
import { calculatePrice } from '@/utils/pricingCalculator';
import { ReceiptBuilder } from '@/components/admin/ReceiptBuilder';
import ClientModal from '@/components/ClientModal';
import FeedbackModal from '@/components/FeedbackModal';
import GettingStartedWidget from '@/components/GettingStartedWidget';

type LensStep = 'scan' | 'configure' | 'receipt';

function LacqrLensContent() {
    const { menu } = useServiceStore();
    const searchParams = useSearchParams();
    const router = useRouter();

    const [image, setImage] = useState<string | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [result, setResult] = useState<ServiceSelection | null>(null);
    const [isBlurry, setIsBlurry] = useState(false);
    const [zoomLevel, setZoomLevel] = useState(1);
    const [showHelp, setShowHelp] = useState(false);
    const [showFullImage, setShowFullImage] = useState(false);
    const [step, setStep] = useState<LensStep>('scan');
    const [mode, setMode] = useState<'diagnostics' | 'design'>('design');

    // History State
    const [recentScans, setRecentScans] = useState<any[]>([]);
    const [showHistory, setShowHistory] = useState(false);

    const { user } = useAppStore();

    // Fetch History
    useEffect(() => {
        const fetchHistory = async () => {
            if (!user?.id) return;
            try {
                const q = query(
                    collection(db, 'quotes'),
                    where('userId', '==', user.id),
                    orderBy('createdAt', 'desc'),
                    limit(5)
                );
                const snapshot = await getDocs(q);
                const scans = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setRecentScans(scans);
            } catch (error) {
                console.error("Error fetching history:", error);
            }
        };
        fetchHistory();
    }, [user?.id, step]); // Re-fetch when step changes (e.g. after saving a quote)

    // Persistence Effects
    // Persistence Effects Removed as per user request
    // Scans should not persist on refresh, but should be saved to history.

    // Resume Draft Logic via Query Param
    useEffect(() => {
        const draftId = searchParams.get('draftId');
        if (draftId) {
            loadFromHistory(draftId);
            // Remove query param to clean URL
            router.replace('/dashboard/lacqr-lens');
        }
    }, [searchParams, router]);

    // Safety Check: If step is receipt but result is invalid, reset to scan
    useEffect(() => {
        if (step === 'receipt' && (!result || !result.base)) {
            console.warn("Invalid state for receipt (missing result), resetting to scan.");
            setStep('scan');
        }
    }, [step, result]);

    const loadFromHistory = async (id: string) => {
        try {
            const draftDoc = await getDoc(doc(db, 'quotes', id));
            if (draftDoc.exists()) {
                const data = draftDoc.data();
                setResult(data.data);
                setStep('configure');
                // Note: We don't have the original image for history items unless we stored it in Storage (which we don't yet).
                // So we might need to handle "no image" state in configure mode, or just show a placeholder.
                setImage(null);
                setShowHistory(false);
            }
        } catch (error) {
            console.error("Error loading draft:", error);
        }
    };

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
            // Check file size (Max 10MB)
            if (file.size > 10 * 1024 * 1024) {
                alert("File is too large. Please upload an image smaller than 10MB.");
                return;
            }

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
                const analysis = await AI_SERVICE.analyzeImage(compressedFile, mode); // Pass mode to AI
                setResult(analysis);
                setStep('configure'); // Move to configure step
                startCooldown();

                // Auto-save to history
                if (user?.id) {
                    try {
                        const { addDoc, collection } = await import('firebase/firestore');
                        const { db } = await import('@/lib/firebase');

                        // Sanitize
                        const cleanData = JSON.parse(JSON.stringify(analysis));
                        if (cleanData.modalResult) delete cleanData.modalResult;

                        await addDoc(collection(db, 'quotes'), {
                            userId: user.id,
                            status: 'history', // Distinct status for auto-saved history
                            data: cleanData,
                            createdAt: new Date(),
                            salonName: user.name || "My Salon",
                            totalPrice: calculatePrice(analysis, menu).total,
                            clientName: 'Auto-Save'
                        });

                        // Refresh history list
                        const q = query(
                            collection(db, 'quotes'),
                            where('userId', '==', user.id),
                            orderBy('createdAt', 'desc'),
                            limit(5)
                        );
                        const snapshot = await getDocs(q);
                        const scans = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                        setRecentScans(scans);

                    } catch (err) {
                        console.error("Auto-save failed", err);
                    }
                }
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
        setStep('scan');
        // Clear persistence removed
    };

    const toggleZoom = () => {
        setZoomLevel(prev => prev === 1 ? 2.5 : 1);
    };

    const handleRetake = () => {
        reset();
    };

    const handleConfirm = () => {
        setStep('receipt');
    };

    // --- Receipt Actions ---
    const handleSaveDraft = async (finalSelection: ServiceSelection) => {
        if (!user.isAuthenticated || !user.id) {
            alert("Please log in to save drafts.");
            return;
        }

        try {
            const { addDoc, collection } = await import('firebase/firestore');
            const { db } = await import('@/lib/firebase');

            const expiresAt = new Date();
            expiresAt.setDate(expiresAt.getDate() + 14);

            // Sanitize selection to remove undefined values and nested arrays (Firestore rejects them)
            const sanitize = (obj: any): any => {
                const clean = JSON.parse(JSON.stringify(obj));
                if (clean.modalResult) delete clean.modalResult;
                return clean;
            };

            const cleanData = sanitize(finalSelection);

            await addDoc(collection(db, 'quotes'), {
                userId: user.id,
                status: 'draft',
                data: cleanData,
                createdAt: new Date(),
                expiresAt: expiresAt,
                salonName: user.name || "My Salon",
                totalPrice: calculatePrice(finalSelection, menu).total
            });

            alert("Draft saved! It will be kept for 14 days.");
        } catch (error: any) {
            console.error("Error saving draft:", error);
            alert(`Failed to save draft: ${error.message}`);
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
            // Sanitize selection (remove modalResult)
            const cleanData = JSON.parse(JSON.stringify(result));
            if (cleanData.modalResult) delete cleanData.modalResult;

            const totalPrice = calculatePrice(result, menu).total;
            await addDoc(collection(db, 'quotes'), {
                type: 'assigned',
                data: cleanData,
                totalPrice: totalPrice,
                createdAt: new Date(),
                salonName: user.name || "Your Salon",
                userId: user.id,
                clientId: client.id,
                clientName: client.name,
                status: 'pending'
            });

            alert(`Quote saved for ${client.name}!`);
            // Do NOT reset automatically. Let the user decide.
            // reset();
        } catch (error) {
            console.error("Error saving quote:", error);
            alert("Failed to save quote.");
        }
    };

    // --- Render ---
    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Main Scanner Card */}
            <div className="flex flex-col max-w-2xl mx-auto relative bg-white rounded-[2.5rem] shadow-xl overflow-hidden border-4 border-pink-100 my-4 transition-all duration-500">

                {/* Header with Segmented Control */}
                <div className="p-6 z-10 space-y-6 bg-gradient-to-b from-pink-50 to-white">
                    <div className="flex justify-between items-center">
                        <button onClick={() => router.back()} className="p-2 bg-white border border-pink-100 rounded-full text-gray-500 hover:text-pink-600 hover:border-pink-300 transition-all shadow-sm">
                            <X size={24} />
                        </button>
                        <h2 className="text-pink-900 font-bold text-lg tracking-wide">Lacqr Lens</h2>
                        <button onClick={() => setShowHelp(true)} className="p-2 bg-white border border-pink-100 rounded-full text-gray-500 hover:text-pink-600 hover:border-pink-300 transition-all shadow-sm">
                            <HelpCircle size={24} />
                        </button>
                    </div>

                    {/* Large Segmented Control */}
                    <div className="bg-gray-100 p-1.5 rounded-2xl flex relative shadow-inner">
                        {/* Sliding Background */}
                        <div
                            className={`absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] bg-white rounded-xl shadow-md transition-all duration-300 ease-out ${mode === 'diagnostics' ? 'left-1.5' : 'left-[calc(50%+6px)]'
                                }`}
                        />

                        <button
                            onClick={() => setMode('diagnostics')}
                            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl relative z-10 transition-colors duration-300 ${mode === 'diagnostics' ? 'text-pink-600 font-bold' : 'text-gray-500 font-medium hover:text-gray-700'
                                }`}
                        >
                            <Scan size={18} />
                            <span>Assess Hand</span>
                        </button>
                        <button
                            onClick={() => setMode('design')}
                            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl relative z-10 transition-colors duration-300 ${mode === 'design' ? 'text-purple-600 font-bold' : 'text-gray-500 font-medium hover:text-gray-700'
                                }`}
                        >
                            <Sparkles size={18} />
                            <span>Analyze Inspo</span>
                        </button>
                    </div>
                </div>

                {/* Camera Viewfinder */}
                <div className="relative mx-4 mb-4 rounded-3xl overflow-hidden bg-gray-50 border-2 border-dashed border-pink-200 group min-h-[400px]">

                    {/* Image Display */}
                    {image && (
                        <img
                            src={image}
                            alt="Captured"
                            className={`w-full h-full object-cover absolute inset-0 transition-opacity duration-500 ${isAnalyzing ? 'opacity-50 blur-sm' : 'opacity-100'}`}
                        />
                    )}

                    {/* Scanning Overlay - Always render if analyzing, or if no image (idle state) */}
                    {(isAnalyzing || !image) && (
                        <div className="absolute inset-0 z-20 pointer-events-none">
                            <ScanningOverlay isScanning={isAnalyzing} mode={mode} />
                        </div>
                    )}

                    {/* Empty State: Text & Button */}
                    {!isAnalyzing && !image && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center z-30 pointer-events-none gap-8">
                            {/* Contextual Hint */}
                            <div className="text-center px-8 max-w-md animate-in fade-in slide-in-from-bottom-4 duration-700">
                                <p className="text-gray-500 text-lg font-medium">
                                    {mode === 'diagnostics'
                                        ? "Point camera at client's hand to detect regrowth and repairs."
                                        : "Upload photo to match colors and calculate design price."}
                                </p>
                            </div>

                            {/* Start Scan Button */}
                            <div className="relative group pointer-events-auto">
                                <div className="absolute -inset-4 bg-gradient-to-r from-pink-200 to-purple-200 rounded-full blur-xl opacity-50 group-hover:opacity-75 transition duration-1000 group-hover:duration-200 animate-pulse"></div>
                                <label className="relative w-32 h-32 bg-white rounded-full flex flex-col items-center justify-center cursor-pointer hover:scale-105 transition-transform shadow-[0_8px_30px_rgb(0,0,0,0.12)] border-4 border-pink-50">
                                    <Camera size={40} className="text-pink-500 mb-2" />
                                    <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Tap to Scan</span>
                                    <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
                                </label>
                            </div>
                        </div>
                    )}

                    {/* Retake Button (Top Right when image present) */}
                    {image && !isAnalyzing && (
                        <button
                            onClick={handleRetake}
                            className="absolute top-4 right-4 p-2 bg-white/80 backdrop-blur-md rounded-full text-gray-700 hover:text-red-500 transition-all shadow-sm z-50"
                        >
                            <RefreshCw size={20} />
                        </button>
                    )}
                </div>

                {/* History Drawer Toggle */}
                {!image && (
                    <div className="flex justify-center pb-6">
                        <button onClick={() => setShowHistory(true)} className="text-gray-400 hover:text-pink-500 flex items-center gap-2 text-sm font-medium transition-colors">
                            <History size={16} /> Recent Scans
                        </button>
                    </div>
                )}

                {/* History Drawer */}
                {showHistory && (
                    <div className="absolute inset-0 bg-white/95 backdrop-blur-sm z-50 p-6 animate-in slide-in-from-bottom-10">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-gray-800 font-bold text-xl">Recent Scans</h2>
                            <button onClick={() => setShowHistory(false)} className="text-gray-400 hover:text-gray-600">
                                <X size={24} />
                            </button>
                        </div>
                        <div className="space-y-4">
                            {recentScans.length > 0 ? (
                                recentScans.map(scan => (
                                    <div key={scan.id} className="bg-gray-50 border border-gray-100 p-4 rounded-xl flex gap-4 items-center cursor-pointer hover:bg-pink-50 hover:border-pink-100 transition-all" onClick={() => loadFromHistory(scan.id)}>
                                        <div className="w-12 h-12 bg-white rounded-lg overflow-hidden flex items-center justify-center text-pink-200 border border-gray-100 shadow-sm">
                                            <Scan size={20} />
                                        </div>
                                        <div>
                                            <p className="text-gray-800 font-bold">{scan.clientName || 'Unknown Client'}</p>
                                            <p className="text-gray-400 text-xs">{new Date(scan.createdAt?.seconds * 1000).toLocaleDateString()}</p>
                                        </div>
                                        <div className="ml-auto font-bold text-pink-500">${scan.totalPrice}</div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-8 text-gray-400">
                                    <History size={48} className="mx-auto mb-2 opacity-20" />
                                    <p>No recent scans found.</p>
                                    <p className="text-xs mt-1">Saved quotes will appear here.</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Results Section - Appears BELOW the scanner */}
            {result && !isAnalyzing && (
                <div className="max-w-2xl mx-auto px-4 space-y-6 animate-in slide-in-from-bottom-8 duration-700">

                    {/* AI Explanation Card */}
                    {result.visual_description && (
                        <div className="bg-gradient-to-br from-gray-900 to-black text-white p-6 rounded-3xl shadow-xl border border-gray-800">
                            <div className="flex items-center gap-3 mb-4 text-pink-400">
                                <BrainCircuit size={24} />
                                <h3 className="font-bold text-base uppercase tracking-wider">AI Analysis</h3>
                            </div>
                            <p className="text-gray-300 leading-relaxed italic text-lg">
                                &quot;{result.visual_description}&quot;
                            </p>
                        </div>
                    )}

                    {/* Result Preview List */}
                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                        <div className="flex items-center gap-3 mb-6">
                            <div className={`p-3 rounded-2xl ${mode === 'diagnostics' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'}`}>
                                {mode === 'diagnostics' ? <Scan size={24} /> : <Sparkles size={24} />}
                            </div>
                            <h2 className="font-bold text-xl text-charcoal">
                                {mode === 'diagnostics' ? 'Required Prep' : 'Design Elements'}
                            </h2>
                        </div>

                        <div className="space-y-3">
                            {mode === 'diagnostics' ? (
                                <>
                                    {result.modifiers.foreignWork !== 'None' && (
                                        <div className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl">
                                            <span className="font-medium text-gray-700">{result.modifiers.foreignWork}</span>
                                            <CheckCircle2 size={20} className="text-green-500" />
                                        </div>
                                    )}
                                    {result.modifiers.repairsCount > 0 && (
                                        <div className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl">
                                            <span className="font-medium text-gray-700">{result.modifiers.repairsCount} Nail Repair(s)</span>
                                            <CheckCircle2 size={20} className="text-green-500" />
                                        </div>
                                    )}
                                    {result.extras && result.extras.length > 0 ? (
                                        result.extras.map((extra, idx) => (
                                            <div key={idx} className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl">
                                                <span className="font-medium text-gray-700">{extra.name}</span>
                                                <CheckCircle2 size={20} className="text-green-500" />
                                            </div>
                                        ))
                                    ) : (
                                        result.modifiers.foreignWork === 'None' && result.modifiers.repairsCount === 0 && (
                                            <p className="text-gray-400 text-sm italic text-center py-2">No major issues detected. Ready for prep!</p>
                                        )
                                    )}
                                </>
                            ) : (
                                <>
                                    <div className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl">
                                        <span className="font-medium text-gray-700">{result.base.shape} Shape</span>
                                        <CheckCircle2 size={20} className="text-green-500" />
                                    </div>
                                    <div className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl">
                                        <span className="font-medium text-gray-700">{result.base.length} Length</span>
                                        <CheckCircle2 size={20} className="text-green-500" />
                                    </div>
                                    {result.art.level && result.art.level !== 'Level 1' && (
                                        <div className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl">
                                            <span className="font-medium text-gray-700">{result.art.level} Art</span>
                                            <CheckCircle2 size={20} className="text-green-500" />
                                        </div>
                                    )}
                                    {result.addons.specialtyEffect !== 'None' && (
                                        <div className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl">
                                            <span className="font-medium text-gray-700">{result.addons.specialtyEffect}</span>
                                            <CheckCircle2 size={20} className="text-green-500" />
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>

                    {/* Service Configurator */}
                    <div className="mt-6">
                        <ServiceConfigurator
                            initialSelection={result}
                            onUpdate={(updated) => setResult(updated)}
                        />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-4 pt-4 pb-12">
                        <button
                            onClick={() => setStep('receipt')}
                            className="flex-1 bg-pink-500 text-white py-4 rounded-2xl font-bold text-lg shadow-lg shadow-pink-200 hover:bg-pink-600 transition-all flex items-center justify-center gap-2"
                        >
                            Generate Receipt <ArrowRight size={20} />
                        </button>
                    </div>
                </div>
            )}

            {step === 'receipt' && result && result.base && (
                <div className="fixed inset-0 z-50 bg-gray-50 overflow-y-auto animate-in slide-in-from-bottom-full duration-500">
                    <div className="max-w-2xl mx-auto min-h-screen p-4">
                        <div className="flex items-center gap-2 mb-6">
                            <button
                                onClick={() => setStep('scan')}
                                className="p-2 bg-white border border-gray-200 rounded-full text-gray-500 hover:text-black transition-all"
                            >
                                <ArrowLeft size={24} />
                            </button>
                            <h2 className="font-bold text-xl">Final Receipt</h2>
                        </div>

                        <ReceiptBuilder
                            initialSelection={result}
                            onSaveDraft={handleSaveDraft}
                            onAssignClient={handleAssignClient}
                            onCreateClient={handleCreateClient}
                        />
                    </div>
                </div>
            )}

            {/* Modals */}
            <HelpModal isOpen={showHelp} onClose={() => setShowHelp(false)} context="lacqr_lens" />

            <ClientModal
                isOpen={clientModalOpen}
                mode={clientModalMode}
                onClose={() => setClientModalOpen(false)}
                onClientSelected={handleClientSelected}
            />

            <FeedbackModal
                isOpen={feedbackModalOpen}
                onClose={() => setFeedbackModalOpen(false)}
                context="lacqr_lens"
                aiResult={result}
            />

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

export default function LacqrLens() {
    return (
        <Suspense fallback={<div className="p-8 text-center">Loading Lens...</div>}>
            <LacqrLensContent />
        </Suspense>
    );
}

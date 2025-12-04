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

    const [image, setImage] = useState<string | null>(() => {
        if (typeof window !== 'undefined') return localStorage.getItem('lacqr_lens_image');
        return null;
    });
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [result, setResult] = useState<ServiceSelection | null>(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('lacqr_lens_result');
            return saved ? JSON.parse(saved) : null;
        }
        return null;
    });
    const [isBlurry, setIsBlurry] = useState(false);
    const [zoomLevel, setZoomLevel] = useState(1);
    const [showHelp, setShowHelp] = useState(false);
    const [showFullImage, setShowFullImage] = useState(false);
    const [step, setStep] = useState<LensStep>(() => {
        if (typeof window !== 'undefined') return (localStorage.getItem('lacqr_lens_step') as LensStep) || 'scan';
        return 'scan';
    });
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
    useEffect(() => {
        try {
            if (image) localStorage.setItem('lacqr_lens_image', image);
            else localStorage.removeItem('lacqr_lens_image');
        } catch (e) {
            console.warn("Failed to save image to localStorage (likely quota exceeded):", e);
        }
    }, [image]);

    useEffect(() => {
        if (result) localStorage.setItem('lacqr_lens_result', JSON.stringify(result));
        else localStorage.removeItem('lacqr_lens_result');
    }, [result]);

    useEffect(() => {
        localStorage.setItem('lacqr_lens_step', step);
    }, [step]);

    // Resume Draft Logic via Query Param
    useEffect(() => {
        const draftId = searchParams.get('draftId');
        if (draftId) {
            loadFromHistory(draftId);
            // Remove query param to clean URL
            router.replace('/dashboard/lacqr-lens');
        }
    }, [searchParams, router]);

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
        // Clear persistence
        localStorage.removeItem('lacqr_lens_image');
        localStorage.removeItem('lacqr_lens_result');
        localStorage.removeItem('lacqr_lens_step');
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
    return (
        <>
            {step === 'scan' && (
                <div className="flex flex-col h-[calc(100vh-6rem)] max-w-2xl mx-auto relative bg-gray-900 rounded-[2.5rem] shadow-2xl overflow-hidden border-4 border-gray-800 my-4">
                    {/* Header with Segmented Control */}
                    <div className="p-6 z-10 space-y-6 bg-gradient-to-b from-black/80 to-transparent">
                        <div className="flex justify-between items-center">
                            <button onClick={() => router.back()} className="p-2 bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-white/20 transition-all">
                                <X size={24} />
                            </button>
                            <h2 className="text-white font-bold text-lg tracking-wide opacity-80">Lacqr Lens</h2>
                            <button onClick={() => setShowHelp(true)} className="p-2 bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-white/20 transition-all">
                                <HelpCircle size={24} />
                            </button>
                        </div>

                        {/* Large Segmented Control */}
                        <div className="bg-white/10 backdrop-blur-md p-1.5 rounded-2xl flex relative">
                            {/* Sliding Background */}
                            <div
                                className={`absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] bg-white rounded-xl shadow-lg transition-all duration-300 ease-out ${mode === 'diagnostics' ? 'left-1.5' : 'left-[calc(50%+6px)]'
                                    }`}
                            />

                            <button
                                onClick={() => setMode('diagnostics')}
                                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl relative z-10 transition-colors duration-300 ${mode === 'diagnostics' ? 'text-black font-bold' : 'text-white/60 font-medium hover:text-white'
                                    }`}
                            >
                                <Scan size={18} />
                                <span>Assess Hand</span>
                            </button>
                            <button
                                onClick={() => setMode('design')}
                                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl relative z-10 transition-colors duration-300 ${mode === 'design' ? 'text-black font-bold' : 'text-white/60 font-medium hover:text-white'
                                    }`}
                            >
                                <Sparkles size={18} />
                                <span>Analyze Inspo</span>
                            </button>
                        </div>
                    </div>

                    {/* Camera Viewfinder */}
                    <div className="flex-1 relative mx-4 mb-4 rounded-3xl overflow-hidden bg-black border border-white/10 group">

                        {/* Image Display */}
                        {image && (
                            <img
                                src={image}
                                alt="Captured"
                                className={`w-full h-full object-cover transition-opacity duration-500 ${isAnalyzing ? 'opacity-50 blur-sm' : 'opacity-100'}`}
                            />
                        )}

                        {/* Scanning Overlay - Always render if analyzing, or if no image (idle state) */}
                        {(isAnalyzing || !image) && (
                            <div className="absolute inset-0 z-20">
                                <ScanningOverlay isScanning={isAnalyzing} mode={mode} />
                            </div>
                        )}

                        {/* Contextual Hint Overlay (Only when not analyzing and no image) */}
                        {!isAnalyzing && !image && (
                            <div className="absolute top-1/3 left-0 right-0 text-center px-8 pointer-events-none z-30">
                                <p className="text-white/90 text-xl font-medium drop-shadow-lg animate-in fade-in slide-in-from-bottom-4 duration-700">
                                    {mode === 'diagnostics'
                                        ? "Point camera at client's hand to detect regrowth and repairs."
                                        : "Upload photo to match colors and calculate design price."}
                                </p>
                            </div>
                        )}

                        {/* Start Scan Button (Center) */}
                        {!image && !isAnalyzing && (
                            <div className="absolute inset-0 flex items-center justify-center z-40 pointer-events-none">
                                <div className="relative group pointer-events-auto">
                                    <div className="absolute -inset-1 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-tilt"></div>
                                    <label className="relative w-24 h-24 bg-white rounded-full flex flex-col items-center justify-center cursor-pointer hover:scale-105 transition-transform shadow-2xl">
                                        <Camera size={36} className="text-black mb-1" />
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Tap to Scan</span>
                                        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
                                    </label>
                                </div>
                            </div>
                        )}

                        {/* Bottom Controls (Only when image is present) */}
                        {image && !isAnalyzing && (
                            <div className="absolute bottom-6 left-0 right-0 flex justify-center items-center gap-6 z-50">
                                <button onClick={handleRetake} className="px-6 py-3 bg-black/60 backdrop-blur-md rounded-full text-white font-medium hover:bg-black/80 transition-all border border-white/10 flex items-center gap-2">
                                    <RefreshCw size={18} /> Retake
                                </button>
                                <button onClick={handleConfirm} className="px-8 py-3 bg-white text-black rounded-full font-bold hover:bg-gray-100 transition-all shadow-lg flex items-center gap-2">
                                    Next <ArrowRight size={18} />
                                </button>
                            </div>
                        )}
                    </div>

                    {/* History Drawer Toggle */}
                    {!image && (
                        <div className="absolute bottom-6 left-0 right-0 flex justify-center z-10">
                            <button onClick={() => setShowHistory(true)} className="text-white/50 hover:text-white flex items-center gap-2 text-sm font-medium transition-colors">
                                <History size={16} /> Recent Scans
                            </button>
                        </div>
                    )}

                    {/* History Drawer */}
                    {showHistory && (
                        <div className="absolute inset-0 bg-black/95 z-50 p-6 animate-in slide-in-from-bottom-10">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-white font-bold text-xl">Recent Scans</h2>
                                <button onClick={() => setShowHistory(false)} className="text-white/60 hover:text-white">
                                    <X size={24} />
                                </button>
                            </div>
                            <div className="space-y-4">
                                {recentScans.map(scan => (
                                    <div key={scan.id} className="bg-white/10 p-4 rounded-xl flex gap-4 items-center cursor-pointer hover:bg-white/20 transition-all" onClick={() => loadFromHistory(scan.id)}>
                                        <div className="w-12 h-12 bg-gray-800 rounded-lg overflow-hidden flex items-center justify-center text-white/30">
                                            <Scan size={20} />
                                        </div>
                                        <div>
                                            <p className="text-white font-bold">{scan.clientName || 'Unknown Client'}</p>
                                            <p className="text-white/60 text-xs">{new Date(scan.createdAt?.seconds * 1000).toLocaleDateString()}</p>
                                        </div>
                                        <div className="ml-auto font-bold text-green-400">${scan.totalPrice}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {step === 'configure' && result && (
                <div className="min-h-screen bg-gray-50 pb-20">
                    {/* Header */}
                    <div className="bg-white sticky top-0 z-20 border-b border-gray-100 px-4 py-3 flex items-center justify-between shadow-sm">
                        <button onClick={handleRetake} className="flex items-center text-gray-500 hover:text-black">
                            <ArrowLeft size={20} className="mr-1" /> Retake
                        </button>
                        <h1 className="font-bold text-lg">Review Scan</h1>
                        <button onClick={handleConfirm} className="text-pink-500 font-bold hover:underline">
                            Next
                        </button>
                    </div>

                    <div className="max-w-md mx-auto p-4 space-y-6">
                        {/* Result Preview List */}
                        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 animate-in slide-in-from-bottom-4">
                            <div className="flex items-center gap-3 mb-4">
                                <div className={`p-2 rounded-xl ${mode === 'diagnostics' ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'}`}>
                                    {mode === 'diagnostics' ? <Scan size={20} /> : <Sparkles size={20} />}
                                </div>
                                <h2 className="font-bold text-lg text-charcoal">
                                    {mode === 'diagnostics' ? 'Required Prep' : 'Design Elements'}
                                </h2>
                            </div>

                            <div className="space-y-3">
                                {mode === 'diagnostics' ? (
                                    <>
                                        {result.modifiers.foreignWork !== 'None' && (
                                            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                                                <span className="font-medium text-gray-700">{result.modifiers.foreignWork}</span>
                                                <CheckCircle2 size={16} className="text-green-500" />
                                            </div>
                                        )}
                                        {result.modifiers.repairsCount > 0 && (
                                            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                                                <span className="font-medium text-gray-700">{result.modifiers.repairsCount} Nail Repair(s)</span>
                                                <CheckCircle2 size={16} className="text-green-500" />
                                            </div>
                                        )}
                                        {result.extras && result.extras.length > 0 ? (
                                            result.extras.map((extra, idx) => (
                                                <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                                                    <span className="font-medium text-gray-700">{extra.name}</span>
                                                    <CheckCircle2 size={16} className="text-green-500" />
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
                                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                                            <span className="font-medium text-gray-700">{result.base.shape} Shape</span>
                                            <CheckCircle2 size={16} className="text-green-500" />
                                        </div>
                                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                                            <span className="font-medium text-gray-700">{result.base.length} Length</span>
                                            <CheckCircle2 size={16} className="text-green-500" />
                                        </div>
                                        {result.art.level && result.art.level !== 'Level 1' && (
                                            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                                                <span className="font-medium text-gray-700">{result.art.level} Art</span>
                                                <CheckCircle2 size={16} className="text-green-500" />
                                            </div>
                                        )}
                                        {result.addons.specialtyEffect !== 'None' && (
                                            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                                                <span className="font-medium text-gray-700">{result.addons.specialtyEffect}</span>
                                                <CheckCircle2 size={16} className="text-green-500" />
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Service Configurator */}
                        <ServiceConfigurator
                            initialSelection={result}
                            onUpdate={(updated) => setResult(updated)}
                        />

                        {/* AI Explanation Card */}
                        {result.visual_description && (
                            <div className="bg-gradient-to-br from-gray-900 to-black text-white p-5 rounded-2xl shadow-lg">
                                <div className="flex items-center gap-2 mb-3 text-pink-400">
                                    <BrainCircuit size={18} />
                                    <h3 className="font-bold text-sm uppercase tracking-wider">AI Analysis</h3>
                                </div>
                                <p className="text-sm text-gray-300 leading-relaxed italic">
                                    &quot;{result.visual_description}&quot;
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {step === 'receipt' && result && (
                <div className="min-h-screen bg-gray-50 pb-20">
                    <div className="flex items-center gap-2 mb-4 p-4">
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
        </>
    );
}

export default function LacqrLens() {
    return (
        <Suspense fallback={<div className="p-8 text-center">Loading Lens...</div>}>
            <LacqrLensContent />
        </Suspense>
    );
}

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
            )
}

{
    step === 'configure' && result && (
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
    )
}

{
    step === 'receipt' && result && (
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
    )
}

{/* Modals */ }
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

{
    showFullImage && image && (
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
    )
}
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

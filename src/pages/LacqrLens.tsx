import React, { useState, useEffect } from 'react';
import { Camera, X, AlertCircle, AlertTriangle, ZoomIn, ZoomOut, Check, Save, Share2, HelpCircle } from 'lucide-react';
import { AI_SERVICE } from '../services/ai';
import { isImageBlurry, compressImage } from '../utils/imageProcessing';
import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp, doc, updateDoc, arrayUnion } from 'firebase/firestore';
import type { ServiceSelection } from '../types/serviceSchema';
import ScanningOverlay from '../components/ScanningOverlay';
import { useCooldown } from '../hooks/useCooldown';
import HelpModal from '../components/HelpModal';
import { useServiceStore } from '../store/useServiceStore';
import { useAppStore } from '../store/useAppStore';
import type { Client } from '../types/client';
import ServiceConfigurator from '../components/ServiceConfigurator';
import { calculatePrice } from '../utils/pricingCalculator';

export default function LacqrLens() {
    const { menu } = useServiceStore();
    const [image, setImage] = useState<string | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [result, setResult] = useState<ServiceSelection | null>(null);
    const [isBlurry, setIsBlurry] = useState(false);
    const [zoomLevel, setZoomLevel] = useState(1);
    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [showHelp, setShowHelp] = useState(false);
    const [showFullImage, setShowFullImage] = useState(false);
    const [correctionMode, setCorrectionMode] = useState(false);

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
            setSaveSuccess(false);
            setError(null);
            setCorrectionMode(false);

            try {
                // Compress image before sending to AI
                const compressedFile = await compressImage(file);
                const analysis = await AI_SERVICE.analyzeImage(compressedFile); // No longer passing menu, AI returns ServiceSelection
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
        setIsBlurry(false);
        setZoomLevel(1);
        setSaveSuccess(false);
        setCorrectionMode(false);
    };

    const toggleZoom = () => {
        setZoomLevel(prev => prev === 1 ? 2.5 : 1);
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
                finalSelection: result,
                imageUrl: imageUrl,
                timestamp: serverTimestamp(),
                deviceInfo: {
                    userAgent: navigator.userAgent,
                    screenSize: `${window.innerWidth}x${window.innerHeight}`
                },
                correctionType: ['smart_configurator']
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

    const shareQuote = async () => {
        if (!result) return;
        try {
            const { addDoc, collection } = await import('firebase/firestore');
            const { db } = await import('../lib/firebase');

            const totalPrice = calculatePrice(result, menu);

            const quoteData = {
                type: 'lens_v2',
                data: result,
                totalPrice: totalPrice,
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
                        service: `${result.base.system} ${result.base.length}`,
                        price: totalPrice,
                        notes: "Generated via Lacqr Lens V2",
                        image: image
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
                                {error}
                            </p>
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

            {/* Upload Area */}
            {!image ? (
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

                        {/* Bounding Box Overlay */}
                        {!isAnalyzing && result?.modalResult?.objects && (
                            <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'center' }}>
                                {result.modalResult.objects.map((_obj: any, _i: number) => {
                                    // Convert normalized coordinates (if needed) or use pixel values
                                    // Assuming box is [x1, y1, x2, y2] in pixels relative to the original image
                                    // We need to map this to the displayed image size. 
                                    // For simplicity in this "contain" mode, we might need more complex mapping.
                                    // BUT, if the backend returns normalized coordinates (0-1), it's easier.
                                    // Let's assume pixel values for now and try to render them directly if possible, 
                                    // or just render a simple overlay if we can't map perfectly without image dimensions.

                                    // Actually, let's use a simpler approach: Just show the label if we can't map perfectly yet.
                                    // Or better: The backend returns pixel values. We need the original image size to map to the rendered size.
                                    // Since we don't have easy access to naturalWidth/Height here without an onLoad handler,
                                    // let's try to render them assuming the SVG matches the image aspect ratio (which it might not in 'object-contain').

                                    // STRATEGY: Use a percentage-based approach if possible, or just render the boxes 
                                    // if we assume the image fills the container (which it doesn't always).

                                    // For this iteration, let's just add a "Debug" list of detections below the image 
                                    // if we can't do perfect boxes, OR try to do boxes if we assume the image is 640x640 (YOLO standard).

                                    // Let's try to render them assuming the backend sends normalized coordinates? 
                                    // No, YOLO sends pixels. 

                                    // Let's skip the complex SVG for a second and add the "Itemized Breakdown" the user asked for first,
                                    // as that is easier and high value.

                                    return null;
                                })}
                            </svg>
                        )}
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
                <div className="space-y-6 animate-in slide-in-from-bottom-10 fade-in duration-500">

                    {/* Visual Description Card */}
                    {result.visual_description && (
                        <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-xl">
                            <h4 className="text-xs font-bold text-indigo-800 uppercase tracking-wider mb-2">AI Visual Analysis</h4>
                            <p className="text-sm text-indigo-900 italic">"{result.visual_description}"</p>
                        </div>
                    )}

                    {/* Tech Override Toggle */}
                    <div className="flex justify-end">
                        <button
                            onClick={() => setCorrectionMode(!correctionMode)}
                            className={`text-sm font-bold underline ${correctionMode ? 'text-pink-500' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            {correctionMode ? 'Hide Configurator' : 'Tech Override / Correct'}
                        </button>
                    </div>

                    {/* Service Configurator */}
                    <ServiceConfigurator
                        initialSelection={result}
                        onUpdate={(updatedSelection) => setResult(updatedSelection)}
                    />

                    {/* Client Selection */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
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

                    {/* Action Buttons */}
                    <div className="flex space-x-3">
                        <button
                            onClick={saveCorrection}
                            disabled={isSaving}
                            className={`flex-1 py-4 rounded-xl font-bold text-white shadow-lg transition-all flex items-center justify-center space-x-2 ${saveSuccess ? 'bg-green-500' : 'bg-charcoal hover:bg-black'}`}
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
        </div>
    );
}

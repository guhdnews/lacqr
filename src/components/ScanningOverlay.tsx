import { useState, useEffect } from 'react';
import { Scan, Sparkles, BrainCircuit, CheckCircle2, Stethoscope, Activity, Search } from 'lucide-react';

interface ScanningOverlayProps {
    isScanning: boolean;
    mode?: 'diagnostics' | 'design';
    onCancel?: () => void;
}

const DESIGN_STEPS = [
    { icon: Scan, text: "Scanning nail geometry...", color: "text-blue-500" },
    { icon: BrainCircuit, text: "Analyzing art complexity...", color: "text-purple-500" },
    { icon: Sparkles, text: "Identifying add-ons...", color: "text-yellow-500" },
    { icon: CheckCircle2, text: "Calculating estimate...", color: "text-green-500" }
];

const DIAGNOSTICS_STEPS = [
    { icon: Scan, text: "Scanning hand structure...", color: "text-blue-500" },
    { icon: Search, text: "Detecting growth & lifting...", color: "text-purple-500" },
    { icon: Activity, text: "Analyzing skin health...", color: "text-yellow-500" },
    { icon: Stethoscope, text: "Generating treatment plan...", color: "text-green-500" }
];

export default function ScanningOverlay({ isScanning, mode = 'design', onCancel }: ScanningOverlayProps) {
    const [activeStep, setActiveStep] = useState(0);
    const [showLongWait, setShowLongWait] = useState(false);

    const steps = mode === 'diagnostics' ? DIAGNOSTICS_STEPS : DESIGN_STEPS;

    useEffect(() => {
        if (!isScanning) {
            setActiveStep(0);
            setShowLongWait(false);
            return;
        }

        // Step Animation
        const stepInterval = setInterval(() => {
            setActiveStep(prev => (prev < steps.length - 1 ? prev + 1 : prev));
        }, 1500);

        // Long Wait Timer (10s)
        const waitTimer = setTimeout(() => {
            setShowLongWait(true);
        }, 10000);

        return () => {
            clearInterval(stepInterval);
            clearTimeout(waitTimer);
        };
    }, [isScanning, steps.length]);

    if (!isScanning) return null;

    return (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm rounded-3xl p-4">
            <div className="w-full max-w-sm text-center space-y-8">

                {/* Main Loader */}
                <div className="relative mx-auto w-24 h-24">
                    <div className="absolute inset-0 border-4 border-gray-700 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        {mode === 'diagnostics' ? (
                            <Activity className="text-pink-500 animate-pulse" size={32} />
                        ) : (
                            <Sparkles className="text-pink-500 animate-pulse" size={32} />
                        )}
                    </div>
                </div>

                {/* Steps */}
                <div className="space-y-4 px-4">
                    {steps.map((step, index) => {
                        const Icon = step.icon;
                        const isActive = index === activeStep;
                        const isCompleted = index < activeStep;

                        return (
                            <div
                                key={index}
                                className={`flex items-center space-x-3 transition-all duration-500 ${isActive || isCompleted ? 'opacity-100 transform translate-x-0' : 'opacity-30 transform -translate-x-2'
                                    }`}
                            >
                                <div className={`
                                    w-8 h-8 rounded-full flex items-center justify-center transition-colors
                                    ${isActive ? 'bg-pink-500/20 ' + step.color : ''}
                                    ${isCompleted ? 'bg-green-500/20 text-green-400' : ''}
                                    ${!isActive && !isCompleted ? 'bg-gray-800 text-gray-500' : ''}
                                `}>
                                    {isCompleted ? <CheckCircle2 size={16} /> : <Icon size={16} />}
                                </div>
                                <span className={`text-sm font-medium ${isActive ? 'text-white' : 'text-gray-400'}`}>
                                    {step.text}
                                </span>
                            </div>
                        );
                    })}
                </div>

                {onCancel && (
                    <button
                        onClick={onCancel}
                        className="mt-8 px-6 py-2 rounded-full border border-gray-600 text-gray-300 text-sm hover:bg-gray-800 hover:text-white transition-colors"
                    >
                        Cancel Scan
                    </button>
                )}

                {/* Cold Start Warning (Time-Based) */}
                {showLongWait && (
                    <p className="text-xs text-amber-400 animate-in fade-in slide-in-from-bottom-2 duration-1000 mt-4 max-w-[200px] mx-auto">
                        First scans take a little longer... hang tight! ⏳
                    </p>
                )}

                <p className="text-xs text-gray-500 animate-pulse mt-4">
                    Powered by Lacqr AI
                </p>
            </div>
        </div>
    );
}

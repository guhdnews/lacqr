import { useState, useEffect } from 'react';
import { Scan, Sparkles, BrainCircuit, CheckCircle2 } from 'lucide-react';

interface ScanningOverlayProps {
    isVisible: boolean;
    currentStep?: number; // Optional override
    onCancel?: () => void;
}

const STEPS = [
    { icon: Scan, text: "Scanning nail geometry...", color: "text-blue-500" },
    { icon: BrainCircuit, text: "Analyzing art complexity...", color: "text-purple-500" },
    { icon: Sparkles, text: "Identifying add-ons...", color: "text-yellow-500" },
    { icon: CheckCircle2, text: "Calculating estimate...", color: "text-green-500" }
];

export default function ScanningOverlay({ isVisible, onCancel }: ScanningOverlayProps) {
    const [activeStep, setActiveStep] = useState(0);

    useEffect(() => {
        if (!isVisible) {
            setActiveStep(0);
            return;
        }

        const interval = setInterval(() => {
            setActiveStep(prev => (prev < STEPS.length - 1 ? prev + 1 : prev));
        }, 1500); // Change step every 1.5s

        return () => clearInterval(interval);
    }, [isVisible]);

    if (!isVisible) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/90 backdrop-blur-sm">
            <div className="w-full max-w-xs text-center space-y-8 p-6">

                {/* Main Loader */}
                <div className="relative mx-auto w-24 h-24">
                    <div className="absolute inset-0 border-4 border-gray-100 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Sparkles className="text-pink-500 animate-pulse" size={32} />
                    </div>
                </div>

                {/* Steps */}
                <div className="space-y-4">
                    {STEPS.map((step, index) => {
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
                                    ${isActive ? 'bg-pink-100 ' + step.color : ''}
                                    ${isCompleted ? 'bg-green-100 text-green-600' : ''}
                                    ${!isActive && !isCompleted ? 'bg-gray-100 text-gray-300' : ''}
                                `}>
                                    {isCompleted ? <CheckCircle2 size={16} /> : <Icon size={16} />}
                                </div>
                                <span className={`text-sm font-medium ${isActive ? 'text-gray-900' : 'text-gray-400'}`}>
                                    {step.text}
                                </span>
                            </div>
                        );
                    })}
                </div>

                {onCancel && (
                    <button
                        onClick={onCancel}
                        className="mt-8 px-6 py-2 rounded-full border border-gray-300 text-gray-500 text-sm hover:bg-gray-50 hover:text-gray-700 transition-colors"
                    >
                        Cancel Scan
                    </button>
                )}

                <p className="text-xs text-gray-400 animate-pulse mt-4">
                    Powered by Lacqr
                </p>
            </div>
        </div>
    );
}

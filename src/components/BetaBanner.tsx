import { useState, useEffect } from 'react';
import { Sparkles, X } from 'lucide-react';
import { FLAGS, BETA_CONFIG } from '../config/flags';

export default function BetaBanner() {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const dismissed = localStorage.getItem('lacqr_beta_banner_dismissed');
        if (dismissed) {
            setIsVisible(false);
        }
    }, []);

    const handleDismiss = () => {
        setIsVisible(false);
        localStorage.setItem('lacqr_beta_banner_dismissed', 'true');
    };

    if (!FLAGS.IS_BETA || !isVisible) return null;

    return (
        <div className="bg-charcoal text-white px-4 py-3 relative animate-in slide-in-from-top duration-500">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
                <div className="flex items-center space-x-3">
                    <Sparkles size={16} className="text-pink-400" />
                    <p className="text-sm font-medium">
                        <span className="font-bold text-pink-400 mr-2">BETA ACCESS</span>
                        {BETA_CONFIG.BETA_MESSAGE}
                    </p>
                </div>
                <div className="flex items-center space-x-4">
                    <a
                        href={BETA_CONFIG.FEEDBACK_URL}
                        className="text-xs font-bold underline decoration-pink-400 underline-offset-4 hover:text-pink-300 transition-colors hidden md:block"
                    >
                        Report a Bug
                    </a>
                    <button
                        onClick={handleDismiss}
                        className="p-1 hover:bg-white/10 rounded-full transition-colors"
                    >
                        <X size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
}

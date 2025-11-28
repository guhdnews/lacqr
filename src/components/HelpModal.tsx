import { X, HelpCircle, Camera, DollarSign, Edit2 } from 'lucide-react';

interface HelpModalProps {
    isOpen: boolean;
    onClose: () => void;
    context?: 'lacqr_lens' | 'smart_quote';
}

export default function HelpModal({ isOpen, onClose, context = 'lacqr_lens' }: HelpModalProps) {
    if (!isOpen) return null;

    const isSmartQuote = context === 'smart_quote';

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl relative animate-in zoom-in-95 duration-200">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                >
                    <X size={24} />
                </button>

                <div className="text-center mb-6">
                    <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <HelpCircle size={24} className="text-pink-500" />
                    </div>
                    <h3 className="text-xl font-bold text-charcoal">
                        {isSmartQuote ? 'How to use Service Sorter' : 'How to use Lacqr Lens'}
                    </h3>
                    <p className="text-sm text-gray-500">
                        {isSmartQuote ? 'Get service recommendations instantly' : 'Get accurate quotes in seconds'}
                    </p>
                </div>

                <div className="space-y-6">
                    <div className="flex items-start space-x-4">
                        <div className="bg-gray-50 p-2 rounded-lg">
                            <Camera size={20} className="text-charcoal" />
                        </div>
                        <div>
                            <h4 className="font-bold text-sm text-charcoal">1. Snap or Upload</h4>
                            <p className="text-xs text-gray-500 mt-1">
                                Take a clear photo of the nail design or upload one from your gallery. Ensure good lighting for best results.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-start space-x-4">
                        <div className="bg-gray-50 p-2 rounded-lg">
                            <Edit2 size={20} className="text-charcoal" />
                        </div>
                        <div>
                            <h4 className="font-bold text-sm text-charcoal">2. AI Analysis</h4>
                            <p className="text-xs text-gray-500 mt-1">
                                {isSmartQuote
                                    ? 'Our AI analyzes the design to recommend the best services from the menu.'
                                    : 'Our AI detects shape, length, and designs. You can manually adjust any details.'}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-start space-x-4">
                        <div className="bg-gray-50 p-2 rounded-lg">
                            <DollarSign size={20} className="text-charcoal" />
                        </div>
                        <div>
                            <h4 className="font-bold text-sm text-charcoal">3. {isSmartQuote ? 'Book It' : 'Quote & Receipt'}</h4>
                            <p className="text-xs text-gray-500 mt-1">
                                {isSmartQuote
                                    ? 'Copy the generated booking text to send to your nail tech.'
                                    : 'See the estimated total instantly. Switch to "Receipt" mode to download a professional breakdown.'}
                            </p>
                        </div>
                    </div>
                </div>

                <button
                    onClick={onClose}
                    className="w-full mt-8 bg-charcoal text-white font-bold py-3 rounded-xl hover:bg-black transition-colors"
                >
                    Got it!
                </button>
            </div>
        </div>
    );
}

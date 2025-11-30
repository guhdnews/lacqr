import React, { useState } from 'react';
import { X, Download, Share2, Printer, Check, Copy } from 'lucide-react';
import { ServiceSelection } from '../../types/serviceSchema';
import { calculatePrice } from '../../utils/pricingCalculator';
import { useServiceStore } from '../../store/useServiceStore';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface ReceiptBuilderProps {
    initialSelection: ServiceSelection;
    onSaveDraft: (selection: ServiceSelection) => void;
    onAssignClient: () => void;
    onCreateClient: () => void;
}

export function ReceiptBuilder({ initialSelection, onSaveDraft, onAssignClient, onCreateClient }: ReceiptBuilderProps) {
    const { menu } = useServiceStore();
    const [selection, setSelection] = useState<ServiceSelection>(initialSelection);
    const priceResult = calculatePrice(selection, menu);
    const [showSaveOptions, setShowSaveOptions] = useState(false);

    // Default menu for fallback pricing if store is empty
    const DEFAULT_MENU = {
        unitPrices: {
            artLevel1: 5,
            artLevel2: 10,
            artLevel3: 15,
            artLevel4: 20,
            charm: 3,
            xlCharms: 5,
            piercing: 5,
            crystal: 0.5
        }
    };

    const handleDownloadPDF = async () => {
        const element = document.getElementById('receipt-print-view');
        if (!element) return;

        try {
            const canvas = await html2canvas(element, {
                scale: 2, // Higher quality
                backgroundColor: '#ffffff',
                logging: false
            });

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });

            const imgWidth = 210; // A4 width in mm
            const imgHeight = (canvas.height * imgWidth) / canvas.width;

            pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
            pdf.save(`Lacqr-Receipt-${new Date().toISOString().split('T')[0]}.pdf`);
        } catch (error) {
            console.error("PDF Generation failed:", error);
            alert("Failed to generate PDF. Please try again.");
        }
    };

    return (
        <>
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                {/* Header */}
                <div className="bg-gray-900 p-6 text-white flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold">Receipt Preview</h2>
                        <p className="text-gray-400 text-sm">Review final details before saving</p>
                    </div>
                    <div className="text-right">
                        <div className="text-3xl font-black">${priceResult.total}</div>
                        <div className="text-sm text-gray-400">Estimated Total</div>
                    </div>
                </div>

                {/* Receipt Body */}
                <div className="p-6 space-y-6">
                    {/* Line Items */}
                    <div className="space-y-4">
                        <div className="flex justify-between items-center py-2 border-b border-gray-100">
                            <div>
                                <span className="font-bold text-gray-900 block">{selection.base.system}</span>
                                <span className="text-sm text-gray-500">{selection.base.length} / {selection.base.shape}</span>
                            </div>
                            <span className="font-bold">${priceResult.breakdown.base + priceResult.breakdown.length + priceResult.breakdown.shape}</span>
                        </div>

                        {selection.art.level && (
                            <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                <span className="text-gray-700">Art Level: {selection.art.level}</span>
                                <span className="font-bold">${priceResult.breakdown.art}</span>
                            </div>
                        )}

                        {selection.bling.density !== 'None' && (
                            <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                <span className="text-gray-700">Bling: {selection.bling.density}</span>
                                <span className="font-bold">${priceResult.breakdown.bling}</span>
                            </div>
                        )}

                        {selection.bling.xlCharmsCount > 0 && (
                            <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                <span className="text-gray-700">Charms (x{selection.bling.xlCharmsCount})</span>
                                <span className="font-bold">${selection.bling.xlCharmsCount * DEFAULT_MENU.unitPrices.xlCharms}</span>
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="grid grid-cols-2 gap-4 pt-4">
                        <button
                            onClick={() => setShowSaveOptions(true)}
                            className="bg-charcoal text-white py-3 rounded-xl font-bold hover:bg-black transition-colors flex items-center justify-center gap-2"
                        >
                            <Check size={18} />
                            <span>Save Quote</span>
                        </button>
                        <button
                            onClick={handleDownloadPDF}
                            className="border border-gray-200 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                        >
                            <Download size={18} />
                            <span>Download PDF</span>
                        </button>
                    </div>
                </div>

                {/* Save Options Modal Overlay */}
                {showSaveOptions && (
                    <div className="absolute inset-0 bg-white/90 backdrop-blur-sm flex items-center justify-center p-6 z-10 animate-in fade-in">
                        <div className="bg-white shadow-2xl rounded-2xl p-6 w-full max-w-sm border border-gray-100 space-y-3">
                            <h3 className="font-bold text-center text-lg mb-4">Save Quote To...</h3>
                            <button
                                onClick={onAssignClient}
                                className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 text-gray-900 rounded-lg transition-colors font-medium"
                            >
                                Existing Client
                            </button>
                            <button
                                onClick={onCreateClient}
                                className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 text-gray-900 rounded-lg transition-colors font-medium"
                            >
                                New Client
                            </button>
                            <button
                                onClick={() => onSaveDraft(selection)}
                                className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 text-gray-900 rounded-lg transition-colors font-medium"
                            >
                                Save as Draft
                            </button>
                            <button
                                onClick={() => setShowSaveOptions(false)}
                                className="w-full text-center text-sm text-gray-500 hover:text-gray-700 py-2 mt-2"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Print View (Hidden off-screen for PDF generation) */}
            <div id="receipt-print-view" className="fixed -left-[9999px] top-0 w-[800px] bg-white p-12 text-gray-900">
                <div className="text-center mb-12">
                    <h1 className="text-5xl font-black text-gray-900 tracking-tighter mb-2">LACQR</h1>
                    <p className="text-sm text-gray-500 uppercase tracking-widest">Premium Nail Service</p>
                </div>

                <div className="border-t-2 border-b-2 border-gray-900 py-8 mb-10">
                    <div className="flex justify-between items-center mb-4">
                        <span className="font-bold text-xl text-gray-900">Date</span>
                        <span className="font-mono text-lg text-gray-600">{new Date().toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="font-bold text-xl text-gray-900">Time</span>
                        <span className="font-mono text-lg text-gray-600">{new Date().toLocaleTimeString()}</span>
                    </div>
                </div>

                <div className="space-y-6 mb-12">
                    <div className="flex justify-between items-baseline">
                        <div>
                            <span className="font-bold text-2xl text-gray-900 block">{selection.base.system}</span>
                            <span className="text-lg text-gray-500">{selection.base.isFill ? 'Fill In' : 'Full Set'} - {selection.base.length} / {selection.base.shape}</span>
                        </div>
                        <span className="font-mono font-bold text-2xl">${priceResult.breakdown.base + priceResult.breakdown.length + priceResult.breakdown.shape}</span>
                    </div>

                    {selection.art.level && (
                        <div className="flex justify-between items-baseline">
                            <span className="font-medium text-xl text-gray-700">Art Level: {selection.art.level}</span>
                            <span className="font-mono font-bold text-xl">${priceResult.breakdown.art}</span>
                        </div>
                    )}

                    {selection.bling.density !== 'None' && (
                        <div className="flex justify-between items-baseline">
                            <span className="font-medium text-xl text-gray-700">Bling: {selection.bling.density}</span>
                            <span className="font-mono font-bold text-xl">${priceResult.breakdown.bling}</span>
                        </div>
                    )}

                    {selection.bling.xlCharmsCount > 0 && (
                        <div className="flex justify-between items-baseline">
                            <span className="font-medium text-xl text-gray-700">Charms (x{selection.bling.xlCharmsCount})</span>
                            <span className="font-mono font-bold text-xl">${selection.bling.xlCharmsCount * DEFAULT_MENU.unitPrices.xlCharms}</span>
                        </div>
                    )}

                    {selection.extras?.map((extra, i) => (
                        <div key={i} className="flex justify-between items-baseline">
                            <span className="font-medium text-xl text-gray-700">{extra.name}</span>
                            <span className="font-mono font-bold text-xl">${extra.price}</span>
                        </div>
                    ))}
                </div>

                <div className="border-t-4 border-gray-900 pt-8 flex justify-between items-end mb-16">
                    <span className="text-3xl font-bold text-gray-900">Total</span>
                    <span className="text-6xl font-black text-gray-900">${priceResult.total}</span>
                </div>

                <div className="text-center text-gray-400 space-y-2">
                    <p className="text-lg font-medium text-gray-900">Thank you for choosing Lacqr.</p>
                    <p className="text-sm">Generated by Lacqr Lens AI</p>
                    <p className="text-xs mt-4 opacity-50">lacqr.io</p>
                </div>
            </div>
        </>
    );
}

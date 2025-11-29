import { useState, useEffect } from 'react';
import { DEFAULT_MENU, type ServiceSelection, type SystemType, type NailLength, type NailShape, type ArtLevel, type BlingDensity } from '../../types/serviceSchema';
import { calculatePrice } from '../../utils/pricingCalculator';
import { Plus, Trash2, Copy, RefreshCw, Save, Download, UserPlus, User, FileText } from 'lucide-react';

interface ReceiptBuilderProps {
    initialSelection?: ServiceSelection;
    onSaveDraft?: (selection: ServiceSelection) => void;
    onAssignClient?: (selection: ServiceSelection) => void;
    onCreateClient?: (selection: ServiceSelection) => void;
}

export function ReceiptBuilder({ initialSelection, onSaveDraft, onAssignClient, onCreateClient }: ReceiptBuilderProps) {
    // Default empty selection
    const emptySelection: ServiceSelection = {
        base: { system: 'Acrylic', shape: 'Coffin', length: 'Medium', isFill: false },
        addons: { finish: 'Glossy', specialtyEffect: 'None', classicDesign: 'None' },
        art: { level: 'Level 1' },
        bling: { density: 'None', xlCharmsCount: 0, piercingsCount: 0 },
        modifiers: { foreignWork: 'None', repairsCount: 0, soakOffOnly: false },
        pedicure: { type: 'None', toeArtMatch: false },
        extras: []
    };

    const [selection, setSelection] = useState<ServiceSelection>(initialSelection || emptySelection);
    const [newExtraName, setNewExtraName] = useState('');
    const [newExtraPrice, setNewExtraPrice] = useState('');
    const [showSaveOptions, setShowSaveOptions] = useState(false);

    // Update local state if prop changes
    useEffect(() => {
        if (initialSelection) setSelection(initialSelection);
    }, [initialSelection]);

    const priceResult = calculatePrice(selection, DEFAULT_MENU);

    // Helper to extract keys for dropdowns
    const SYSTEMS = Object.keys(DEFAULT_MENU.basePrices) as SystemType[];
    const LENGTHS = Object.keys(DEFAULT_MENU.lengthSurcharges) as NailLength[];
    const SHAPES = Object.keys(DEFAULT_MENU.shapeSurcharges) as NailShape[];
    const ART_LEVELS = ['None', ...Object.keys(DEFAULT_MENU.artLevelPrices)] as (ArtLevel | 'None')[];
    const BLING_LEVELS = Object.keys(DEFAULT_MENU.blingDensityPrices) as BlingDensity[];

    const handleAddExtra = () => {
        if (!newExtraName || !newExtraPrice) return;
        const price = parseFloat(newExtraPrice);
        if (isNaN(price)) return;

        setSelection(prev => ({
            ...prev,
            extras: [...(prev.extras || []), { name: newExtraName, price }]
        }));
        setNewExtraName('');
        setNewExtraPrice('');
    };

    const handleRemoveExtra = (index: number) => {
        setSelection(prev => ({
            ...prev,
            extras: prev.extras?.filter((_, i) => i !== index)
        }));
    };

    const handleCopyReceipt = () => {
        const lines = [
            "🧾 LACQR RECEIPT",
            "----------------",
            `Base Service: ${selection.base.system} (${selection.base.isFill ? 'Fill' : 'Full Set'}) - $${priceResult.breakdown.base}`,
            `Length: ${selection.base.length} - $${priceResult.breakdown.length}`,
            `Shape: ${selection.base.shape} - $${priceResult.breakdown.shape}`,
            selection.art.level ? `Art: ${selection.art.level} - $${priceResult.breakdown.art}` : null,
            selection.bling.density !== 'None' ? `Bling: ${selection.bling.density} - $${priceResult.breakdown.bling}` : null,
            selection.bling.xlCharmsCount > 0 ? `Charms (${selection.bling.xlCharmsCount}): $${selection.bling.xlCharmsCount * DEFAULT_MENU.unitPrices.xlCharms}` : null,
            ...(selection.extras || []).map(e => `${e.name} - $${e.price}`),
            "----------------",
            `TOTAL: $${priceResult.total}`
        ].filter(Boolean).join('\n');

        navigator.clipboard.writeText(lines);
        alert("Receipt copied to clipboard!");
    };

    return (
        <>
            {/* Screen View */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 print:hidden">
                {/* Left: Configuration Form */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                            <h3 className="font-bold text-gray-900">Service Details</h3>
                            <button
                                onClick={() => setSelection(emptySelection)}
                                className="text-sm text-gray-500 hover:text-pink-600 flex items-center gap-1"
                            >
                                <RefreshCw className="w-3 h-3" /> Reset
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* 1. Base Service */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">System</label>
                                    <select
                                        value={selection.base.system}
                                        onChange={(e) => setSelection({ ...selection, base: { ...selection.base, system: e.target.value as SystemType } })}
                                        className="w-full border rounded-lg px-3 py-2 text-sm"
                                    >
                                        {SYSTEMS.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                                    <div className="flex bg-gray-100 rounded-lg p-1">
                                        <button
                                            onClick={() => setSelection({ ...selection, base: { ...selection.base, isFill: false } })}
                                            className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${!selection.base.isFill ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                                        >
                                            Full Set
                                        </button>
                                        <button
                                            onClick={() => setSelection({ ...selection, base: { ...selection.base, isFill: true } })}
                                            className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${selection.base.isFill ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                                        >
                                            Fill In
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* 2. Specs (Length & Shape) */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Length</label>
                                    <select
                                        value={selection.base.length}
                                        onChange={(e) => setSelection({ ...selection, base: { ...selection.base, length: e.target.value as NailLength } })}
                                        className="w-full border rounded-lg px-3 py-2 text-sm"
                                    >
                                        {LENGTHS.map(l => <option key={l} value={l}>{l}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Shape</label>
                                    <select
                                        value={selection.base.shape}
                                        onChange={(e) => setSelection({ ...selection, base: { ...selection.base, shape: e.target.value as NailShape } })}
                                        className="w-full border rounded-lg px-3 py-2 text-sm"
                                    >
                                        {SHAPES.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>
                            </div>

                            {/* 3. Art & Bling */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t pt-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Art Level</label>
                                    <select
                                        value={selection.art.level || 'None'}
                                        onChange={(e) => setSelection({ ...selection, art: { ...selection.art, level: e.target.value === 'None' ? null : e.target.value as ArtLevel } })}
                                        className="w-full border rounded-lg px-3 py-2 text-sm"
                                    >
                                        {ART_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Bling Density</label>
                                    <select
                                        value={selection.bling.density}
                                        onChange={(e) => setSelection({ ...selection, bling: { ...selection.bling, density: e.target.value as BlingDensity } })}
                                        className="w-full border rounded-lg px-3 py-2 text-sm"
                                    >
                                        {BLING_LEVELS.map(b => <option key={b} value={b}>{b}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Charms (Qty)</label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={selection.bling.xlCharmsCount}
                                        onChange={(e) => setSelection({ ...selection, bling: { ...selection.bling, xlCharmsCount: Math.max(0, parseInt(e.target.value) || 0) } })}
                                        className="w-full border rounded-lg px-3 py-2 text-sm"
                                    />
                                </div>
                            </div>

                            {/* 4. Extras Manager */}
                            <div className="border-t pt-4">
                                <h4 className="font-bold text-gray-900 mb-3 text-sm">Custom Extras</h4>
                                <div className="flex gap-2 mb-4">
                                    <input
                                        type="text"
                                        placeholder="Item Name (e.g. Drinks)"
                                        value={newExtraName}
                                        onChange={(e) => setNewExtraName(e.target.value)}
                                        className="flex-1 border rounded-lg px-3 py-2 text-sm"
                                    />
                                    <input
                                        type="number"
                                        placeholder="Price ($)"
                                        value={newExtraPrice}
                                        onChange={(e) => setNewExtraPrice(e.target.value)}
                                        className="w-24 border rounded-lg px-3 py-2 text-sm"
                                    />
                                    <button
                                        onClick={handleAddExtra}
                                        disabled={!newExtraName || !newExtraPrice}
                                        className="bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <Plus className="w-4 h-4" />
                                    </button>
                                </div>

                                <div className="space-y-2">
                                    {selection.extras?.map((extra, idx) => (
                                        <div key={idx} className="flex justify-between items-center bg-gray-50 p-2 rounded border border-gray-100 text-sm">
                                            <span className="font-medium text-gray-700">{extra.name}</span>
                                            <div className="flex items-center gap-3">
                                                <span className="font-bold text-gray-900">${extra.price.toFixed(2)}</span>
                                                <button
                                                    onClick={() => handleRemoveExtra(idx)}
                                                    className="text-red-500 hover:text-red-700"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right: Receipt Preview */}
                <div className="space-y-6">
                    <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 sticky top-6">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h2 className="text-2xl font-black text-gray-900 tracking-tighter">LACQR</h2>
                                <p className="text-xs text-gray-500 uppercase tracking-widest mt-1">Official Receipt</p>
                            </div>
                        </div>

                        <div className="space-y-3 border-b border-gray-100 pb-6 mb-6">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">
                                    {selection.base.system} ({selection.base.isFill ? 'Fill' : 'Full Set'})
                                </span>
                                <span className="font-medium">${priceResult.breakdown.base}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Length: {selection.base.length}</span>
                                <span className="font-medium">${priceResult.breakdown.length}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Shape: {selection.base.shape}</span>
                                <span className="font-medium">${priceResult.breakdown.shape}</span>
                            </div>
                            {selection.art.level && (
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Art: {selection.art.level}</span>
                                    <span className="font-medium">${priceResult.breakdown.art}</span>
                                </div>
                            )}
                            {selection.bling.density !== 'None' && (
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Bling: {selection.bling.density}</span>
                                    <span className="font-medium">${priceResult.breakdown.bling}</span>
                                </div>
                            )}
                            {selection.bling.xlCharmsCount > 0 && (
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Charms (x{selection.bling.xlCharmsCount})</span>
                                    <span className="font-medium">${selection.bling.xlCharmsCount * DEFAULT_MENU.unitPrices.xlCharms}</span>
                                </div>
                            )}
                            {selection.extras?.map((extra, i) => (
                                <div key={i} className="flex justify-between text-sm text-blue-600">
                                    <span>{extra.name}</span>
                                    <span className="font-medium">${extra.price}</span>
                                </div>
                            ))}
                        </div>

                        <div className="flex justify-between items-end mb-8">
                            <div>
                                <p className="text-sm text-gray-500">Total Amount</p>
                                <p className="text-3xl font-black text-gray-900">${priceResult.total}</p>
                            </div>
                        </div>

                        {/* Appointment Details (Moved to Bottom) */}
                        <div className="text-right border-t pt-4 mb-6">
                            <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">Appointment Details</p>
                            <p className="text-sm text-gray-600">{new Date().toLocaleDateString()}</p>
                            <p className="text-sm text-gray-600">{new Date().toLocaleTimeString()}</p>
                        </div>

                        <div className="space-y-3">
                            {!showSaveOptions ? (
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        onClick={handleCopyReceipt}
                                        className="flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-900 py-3 rounded-lg font-medium transition-colors"
                                    >
                                        <Copy className="w-4 h-4" /> Copy
                                    </button>
                                    <button
                                        onClick={() => setShowSaveOptions(true)}
                                        className="flex items-center justify-center gap-2 bg-gray-900 hover:bg-gray-800 text-white py-3 rounded-lg font-medium transition-colors"
                                    >
                                        <Save className="w-4 h-4" /> Save & Finish
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-2 animate-in fade-in slide-in-from-bottom-2">
                                    <button
                                        onClick={() => onCreateClient?.(selection)}
                                        className="w-full flex items-center justify-between px-4 py-3 bg-pink-600 hover:bg-pink-700 text-white rounded-lg transition-colors shadow-sm"
                                    >
                                        <span className="flex items-center gap-2 font-medium"><UserPlus className="w-4 h-4" /> Create New Client</span>
                                    </button>
                                    <button
                                        onClick={() => onAssignClient?.(selection)}
                                        className="w-full flex items-center justify-between px-4 py-3 bg-pink-50 hover:bg-pink-100 text-pink-900 rounded-lg transition-colors"
                                    >
                                        <span className="flex items-center gap-2 font-medium"><User className="w-4 h-4" /> Assign to Client</span>
                                    </button>
                                    <button
                                        onClick={() => onSaveDraft?.(selection)}
                                        className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 text-gray-900 rounded-lg transition-colors"
                                    >
                                        <span className="flex items-center gap-2 font-medium"><FileText className="w-4 h-4" /> Save as Draft</span>
                                    </button>
                                    <button
                                        onClick={() => window.print()}
                                        className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 text-gray-900 rounded-lg transition-colors"
                                    >
                                        <span className="flex items-center gap-2 font-medium"><Download className="w-4 h-4" /> Download PDF</span>
                                    </button>
                                    <button
                                        onClick={() => setShowSaveOptions(false)}
                                        className="w-full text-center text-sm text-gray-500 hover:text-gray-700 py-2"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Print View (Hidden on Screen) */}
            <div className="hidden print:block p-8 max-w-2xl mx-auto h-auto overflow-visible">
                <style type="text/css" media="print">
                    {`
                        @page { size: auto; margin: 20mm; }
                        body { -webkit-print-color-adjust: exact; }
                    `}
                </style>
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-black text-gray-900 tracking-tighter mb-2">LACQR</h1>
                    <p className="text-sm text-gray-500 uppercase tracking-widest">Premium Nail Service</p>
                </div>

                <div className="border-t-2 border-b-2 border-gray-900 py-6 mb-8">
                    <div className="flex justify-between items-center mb-4">
                        <span className="font-bold text-gray-900">Date</span>
                        <span className="font-mono text-gray-600">{new Date().toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="font-bold text-gray-900">Time</span>
                        <span className="font-mono text-gray-600">{new Date().toLocaleTimeString()}</span>
                    </div>
                </div>

                <div className="space-y-4 mb-8">
                    <div className="flex justify-between items-baseline">
                        <div>
                            <span className="font-bold text-lg text-gray-900 block">{selection.base.system}</span>
                            <span className="text-sm text-gray-500">{selection.base.isFill ? 'Fill In' : 'Full Set'} - {selection.base.length} / {selection.base.shape}</span>
                        </div>
                        <span className="font-mono font-bold text-lg">${priceResult.breakdown.base + priceResult.breakdown.length + priceResult.breakdown.shape}</span>
                    </div>

                    {selection.art.level && (
                        <div className="flex justify-between items-baseline">
                            <span className="font-medium text-gray-700">Art Level: {selection.art.level}</span>
                            <span className="font-mono font-bold">${priceResult.breakdown.art}</span>
                        </div>
                    )}

                    {selection.bling.density !== 'None' && (
                        <div className="flex justify-between items-baseline">
                            <span className="font-medium text-gray-700">Bling: {selection.bling.density}</span>
                            <span className="font-mono font-bold">${priceResult.breakdown.bling}</span>
                        </div>
                    )}

                    {selection.bling.xlCharmsCount > 0 && (
                        <div className="flex justify-between items-baseline">
                            <span className="font-medium text-gray-700">Charms (x{selection.bling.xlCharmsCount})</span>
                            <span className="font-mono font-bold">${selection.bling.xlCharmsCount * DEFAULT_MENU.unitPrices.xlCharms}</span>
                        </div>
                    )}

                    {selection.extras?.map((extra, i) => (
                        <div key={i} className="flex justify-between items-baseline">
                            <span className="font-medium text-gray-700">{extra.name}</span>
                            <span className="font-mono font-bold">${extra.price}</span>
                        </div>
                    ))}
                </div>

                <div className="border-t-2 border-gray-900 pt-6 flex justify-between items-end">
                    <span className="text-xl font-bold text-gray-900">Total</span>
                    <span className="text-4xl font-black text-gray-900">${priceResult.total}</span>
                </div>

                <div className="mt-12 text-center text-sm text-gray-400">
                    <p>Thank you for choosing Lacqr.</p>
                    <p className="mt-1">Generated by Lacqr Lens AI</p>
                </div>
            </div>
        </>
    );
}

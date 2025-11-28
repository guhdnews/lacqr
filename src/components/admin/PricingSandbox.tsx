import { useState } from 'react';
import { DEFAULT_MENU } from '../../types/serviceSchema';
import { calculatePrice } from '../../utils/pricingCalculator';
import { RefreshCw } from 'lucide-react';

export function PricingSandbox() {
    const [menu, setMenu] = useState(DEFAULT_MENU);
    const [testSelection, setTestSelection] = useState<any>({
        base: { length: 'Medium', shape: 'Coffin', system: 'Acrylic' },
        art: { level: 'Level 2' },
        bling: { density: 'None' },
        addons: { finish: 'Glossy', specialtyEffect: 'None', classicDesign: 'None' },
        modifiers: { foreignWork: 'None', repairsCount: 0, soakOffOnly: false },
        pedicure: { type: 'None', toeArtMatch: false }
    });

    const priceResult = calculatePrice(testSelection, menu);

    const handlePriceChange = (category: keyof typeof menu, item: string, value: number) => {
        setMenu(prev => ({
            ...prev,
            [category]: {
                ...(prev[category] as any),
                [item]: value
            }
        }));
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left: Rules Editor */}
            <div className="lg:col-span-2 space-y-6">
                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                    <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                        <h3 className="font-bold text-gray-900">Pricing Rules (Edit to Test)</h3>
                        <button
                            onClick={() => setMenu(DEFAULT_MENU)}
                            className="text-sm text-gray-500 hover:text-pink-600 flex items-center gap-1"
                        >
                            <RefreshCw className="w-3 h-3" /> Reset
                        </button>
                    </div>

                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Base Prices */}
                        <div>
                            <h4 className="font-medium text-gray-700 mb-3 border-b pb-1">Base Prices</h4>
                            {Object.entries(menu.basePrices).map(([key, val]) => (
                                <div key={key} className="flex items-center justify-between mb-2">
                                    <label className="text-sm text-gray-600 capitalize">{key.replace(/([A-Z])/g, ' $1')}</label>
                                    <div className="relative w-24">
                                        <span className="absolute left-2 top-1.5 text-gray-400 text-sm">$</span>
                                        <input
                                            type="number"
                                            value={val}
                                            onChange={(e) => handlePriceChange('basePrices', key, Number(e.target.value))}
                                            className="w-full pl-6 pr-2 py-1 border rounded text-right text-sm"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Fill Prices */}
                        <div>
                            <h4 className="font-medium text-gray-700 mb-3 border-b pb-1">Fill Prices</h4>
                            {Object.entries(menu.fillPrices).map(([key, val]) => (
                                <div key={key} className="flex items-center justify-between mb-2">
                                    <label className="text-sm text-gray-600 capitalize">{key.replace(/([A-Z])/g, ' $1')}</label>
                                    <div className="relative w-24">
                                        <span className="absolute left-2 top-1.5 text-gray-400 text-sm">$</span>
                                        <input
                                            type="number"
                                            value={val}
                                            onChange={(e) => handlePriceChange('fillPrices', key, Number(e.target.value))}
                                            className="w-full pl-6 pr-2 py-1 border rounded text-right text-sm"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Length Upcharges */}
                        <div>
                            <h4 className="font-medium text-gray-700 mb-3 border-b pb-1">Length Upcharges</h4>
                            {Object.entries(menu.lengthSurcharges).map(([key, val]) => (
                                <div key={key} className="flex items-center justify-between mb-2">
                                    <label className="text-sm text-gray-600 capitalize">{key}</label>
                                    <div className="relative w-24">
                                        <span className="absolute left-2 top-1.5 text-gray-400 text-sm">$</span>
                                        <input
                                            type="number"
                                            value={val}
                                            onChange={(e) => handlePriceChange('lengthSurcharges', key, Number(e.target.value))}
                                            className="w-full pl-6 pr-2 py-1 border rounded text-right text-sm"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Art Levels */}
                        <div>
                            <h4 className="font-medium text-gray-700 mb-3 border-b pb-1">Art Levels</h4>
                            {Object.entries(menu.artLevelPrices).map(([key, val]) => (
                                <div key={key} className="flex items-center justify-between mb-2">
                                    <label className="text-sm text-gray-600 capitalize">{key}</label>
                                    <div className="relative w-24">
                                        <span className="absolute left-2 top-1.5 text-gray-400 text-sm">$</span>
                                        <input
                                            type="number"
                                            value={val}
                                            onChange={(e) => handlePriceChange('artLevelPrices', key, Number(e.target.value))}
                                            className="w-full pl-6 pr-2 py-1 border rounded text-right text-sm"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Bling Density Prices */}
                        <div>
                            <h4 className="font-medium text-gray-700 mb-3 border-b pb-1">Bling Density</h4>
                            {Object.entries(menu.blingDensityPrices).map(([key, val]) => (
                                <div key={key} className="flex items-center justify-between mb-2">
                                    <label className="text-sm text-gray-600 capitalize">{key}</label>
                                    <div className="relative w-24">
                                        <span className="absolute left-2 top-1.5 text-gray-400 text-sm">$</span>
                                        <input
                                            type="number"
                                            value={val}
                                            onChange={(e) => handlePriceChange('blingDensityPrices', key, Number(e.target.value))}
                                            className="w-full pl-6 pr-2 py-1 border rounded text-right text-sm"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Right: Simulator */}
            <div className="space-y-6">
                <div className="bg-pink-50 border border-pink-200 rounded-xl p-6 sticky top-6">
                    <h3 className="font-bold text-pink-900 mb-4">Simulator</h3>

                    {/* Controls */}
                    <div className="space-y-4 mb-6">
                        <div>
                            <label className="block text-xs font-bold text-pink-700 mb-1">Length</label>
                            <select
                                value={testSelection.base.length}
                                onChange={(e) => setTestSelection({ ...testSelection, base: { ...testSelection.base, length: e.target.value } })}
                                className="w-full p-2 rounded border border-pink-200 text-sm"
                            >
                                {['Short', 'Medium', 'Long', 'XL', 'XXL'].map(o => <option key={o} value={o}>{o}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-pink-700 mb-1">Art Level</label>
                            <select
                                value={testSelection.art.level}
                                onChange={(e) => setTestSelection({ ...testSelection, art: { ...testSelection.art, level: e.target.value } })}
                                className="w-full p-2 rounded border border-pink-200 text-sm"
                            >
                                {['None', 'Level 1', 'Level 2', 'Level 3', 'Level 4'].map(o => <option key={o} value={o}>{o}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-pink-700 mb-1">Bling Density</label>
                            <select
                                value={testSelection.bling.density}
                                onChange={(e) => setTestSelection({ ...testSelection, bling: { ...testSelection.bling, density: e.target.value } })}
                                className="w-full p-2 rounded border border-pink-200 text-sm"
                            >
                                {['None', 'Minimal', 'Moderate', 'Heavy'].map(o => <option key={o} value={o}>{o}</option>)}
                            </select>
                        </div>
                    </div>

                    {/* Receipt */}
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                        <div className="flex justify-between text-sm mb-2">
                            <span className="text-gray-600">Base Price</span>
                            <span className="font-medium">${priceResult.breakdown.base}</span>
                        </div>
                        <div className="flex justify-between text-sm mb-2">
                            <span className="text-gray-600">Length ({testSelection.base.length})</span>
                            <span className="font-medium">${priceResult.breakdown.length}</span>
                        </div>
                        <div className="flex justify-between text-sm mb-2">
                            <span className="text-gray-600">Art ({testSelection.art.level})</span>
                            <span className="font-medium">${priceResult.breakdown.art}</span>
                        </div>
                        <div className="flex justify-between text-sm mb-2">
                            <span className="text-gray-600">Bling ({testSelection.bling.density})</span>
                            <span className="font-medium">${priceResult.breakdown.bling}</span>
                        </div>
                        <div className="border-t border-dashed border-gray-200 my-2 pt-2 flex justify-between font-bold text-lg text-gray-900">
                            <span>Total</span>
                            <span>${priceResult.total}</span>
                        </div>
                    </div>

                    <p className="text-xs text-pink-600 mt-4 text-center">
                        *Changes here do not affect the live site yet.
                    </p>
                </div>
            </div>
        </div>
    );
}

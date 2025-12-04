import { useState } from 'react';
import { useServiceStore } from '../store/useServiceStore';
import { DollarSign, Tag, Info } from 'lucide-react';
import type { SystemType, NailLength, FinishType, ArtLevel, BlingDensity, ForeignWork, PedicureType } from '../types/serviceSchema';

export default function ServiceMenuEditor() {
    const store = useServiceStore();
    const { menu } = store;
    const [activeTab, setActiveTab] = useState<'base' | 'addons' | 'art' | 'modifiers' | 'pedicure'>('base');

    if (!menu || !menu.basePrices) return null;

    return (
        <div className="space-y-6">
            {/* Tabs */}
            <div className="flex space-x-1 bg-gray-100 p-1 rounded-xl w-full overflow-x-auto no-scrollbar">
                {(['base', 'addons', 'art', 'modifiers', 'pedicure'] as const).map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-6 py-2 rounded-lg text-sm font-bold capitalize whitespace-nowrap transition-all flex-shrink-0 ${activeTab === tab ? 'bg-white text-charcoal shadow-sm' : 'text-gray-500 hover:text-charcoal'}`}
                    >
                        {tab === 'art' ? 'Art & Bling' : tab}
                    </button>
                ))}
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden max-w-full">
                {activeTab === 'base' && (
                    <div className="p-6 space-y-8">
                        {/* Base Prices */}
                        <div>
                            <h3 className="font-bold text-charcoal mb-4 flex items-center group relative">
                                <Tag size={18} className="mr-2 text-pink-500" />
                                Base System Prices
                                <div className="ml-2 cursor-help text-gray-400 hover:text-pink-500 relative">
                                    <Info size={16} />
                                    <div className="absolute left-0 bottom-full mb-2 w-64 bg-charcoal text-white text-xs p-3 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-lg">
                                        Set your starting price for a full set. This is the foundation of your smart quote.
                                    </div>
                                </div>
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {Object.keys(menu.basePrices).map((sys) => (
                                    <div key={sys} className="bg-gray-50 p-4 rounded-xl flex justify-between items-center">
                                        <span className="font-medium text-charcoal">{sys}</span>
                                        <div className="relative w-24">
                                            <DollarSign size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
                                            <input
                                                type="number"
                                                value={menu.basePrices[sys as SystemType]}
                                                onChange={(e) => store.updateBasePrice(sys as SystemType, Number(e.target.value))}
                                                className="w-full pl-8 pr-4 py-2 bg-white rounded-lg border border-gray-200 text-right font-bold text-charcoal focus:outline-none focus:border-pink-500"
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Length Surcharges */}
                        <div>
                            <h3 className="font-bold text-charcoal mb-4 flex items-center group relative">
                                <Tag size={18} className="mr-2 text-pink-500" />
                                Length Surcharges
                                <div className="ml-2 cursor-help text-gray-400 hover:text-pink-500 relative">
                                    <Info size={16} />
                                    <div className="absolute left-0 bottom-full mb-2 w-64 bg-charcoal text-white text-xs p-3 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-lg">
                                        Charge for extra time and product. Most techs undercharge for length!
                                    </div>
                                </div>
                            </h3>
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                                {Object.keys(menu.lengthSurcharges).map((len) => (
                                    <div key={len} className="bg-gray-50 p-4 rounded-xl text-center">
                                        <div className="text-sm font-bold text-gray-500 mb-2">{len}</div>
                                        <div className="relative inline-block w-20">
                                            <DollarSign size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
                                            <input
                                                type="number"
                                                value={menu.lengthSurcharges[len as NailLength]}
                                                onChange={(e) => store.updateLengthSurcharge(len as NailLength, Number(e.target.value))}
                                                className="w-full pl-6 pr-2 py-1 bg-white rounded border border-gray-200 text-right font-bold text-sm focus:outline-none focus:border-pink-500"
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'addons' && (
                    <div className="p-6 space-y-8">
                        {/* Finishes */}
                        <div>
                            <h3 className="font-bold text-charcoal mb-4">Finishes</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {Object.keys(menu.finishSurcharges).map((finish) => (
                                    <div key={finish} className="bg-gray-50 p-4 rounded-xl flex justify-between items-center">
                                        <span className="font-medium text-charcoal">{finish}</span>
                                        <div className="relative w-24">
                                            <DollarSign size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
                                            <input
                                                type="number"
                                                value={menu.finishSurcharges[finish as FinishType]}
                                                onChange={(e) => store.updateFinishSurcharge(finish as FinishType, Number(e.target.value))}
                                                className="w-full pl-8 pr-4 py-2 bg-white rounded-lg border border-gray-200 text-right font-bold text-charcoal focus:outline-none focus:border-pink-500"
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'art' && (
                    <div className="p-6 space-y-8">
                        {/* Art Levels */}
                        <div>
                            <h3 className="font-bold text-charcoal mb-4 flex items-center group relative">
                                Art Levels
                                <div className="ml-2 cursor-help text-gray-400 hover:text-pink-500 relative">
                                    <Info size={16} />
                                    <div className="absolute left-0 bottom-full mb-2 w-64 bg-charcoal text-white text-xs p-3 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-lg">
                                        Lacqr&apos;s &quot;Secret Sauce&quot;. Level 1 is simple (lines/dots), Level 4 is hand-painted masterpieces.
                                    </div>
                                </div>
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {Object.keys(menu.artLevelPrices).map((level) => (
                                    <div key={level} className="bg-gray-50 p-4 rounded-xl flex justify-between items-center">
                                        <span className="font-medium text-charcoal">{level}</span>
                                        <div className="relative w-24">
                                            <DollarSign size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
                                            <input
                                                type="number"
                                                value={menu.artLevelPrices[level as ArtLevel]}
                                                onChange={(e) => store.updateArtLevelPrice(level as ArtLevel, Number(e.target.value))}
                                                className="w-full pl-8 pr-4 py-2 bg-white rounded-lg border border-gray-200 text-right font-bold text-charcoal focus:outline-none focus:border-pink-500"
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        {/* Bling Density */}
                        <div>
                            <h3 className="font-bold text-charcoal mb-4">Bling Density</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {Object.keys(menu.blingDensityPrices).map((density) => (
                                    <div key={density} className="bg-gray-50 p-4 rounded-xl flex justify-between items-center">
                                        <span className="font-medium text-charcoal">{density}</span>
                                        <div className="relative w-24">
                                            <DollarSign size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
                                            <input
                                                type="number"
                                                value={menu.blingDensityPrices[density as BlingDensity]}
                                                onChange={(e) => store.updateBlingDensityPrice(density as BlingDensity, Number(e.target.value))}
                                                className="w-full pl-8 pr-4 py-2 bg-white rounded-lg border border-gray-200 text-right font-bold text-charcoal focus:outline-none focus:border-pink-500"
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'modifiers' && (
                    <div className="p-6 space-y-8">
                        {/* Foreign Work */}
                        <div>
                            <h3 className="font-bold text-charcoal mb-4 flex items-center group relative">
                                Foreign Work
                                <div className="ml-2 cursor-help text-gray-400 hover:text-pink-500 relative">
                                    <Info size={16} />
                                    <div className="absolute left-0 bottom-full mb-2 w-64 bg-charcoal text-white text-xs p-3 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-lg">
                                        Don&apos;t work for free! Charge for fixing or removing work from other salons.
                                    </div>
                                </div>
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {Object.keys(menu.modifierSurcharges).map((work) => (
                                    <div key={work} className="bg-gray-50 p-4 rounded-xl flex justify-between items-center">
                                        <span className="font-medium text-charcoal">{work}</span>
                                        <div className="relative w-24">
                                            <DollarSign size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
                                            <input
                                                type="number"
                                                value={menu.modifierSurcharges[work as ForeignWork]}
                                                onChange={(e) => store.updateModifierSurcharge(work as ForeignWork, Number(e.target.value))}
                                                className="w-full pl-8 pr-4 py-2 bg-white rounded-lg border border-gray-200 text-right font-bold text-charcoal focus:outline-none focus:border-pink-500"
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'pedicure' && (
                    <div className="p-6 space-y-8">
                        {/* Pedicure Types */}
                        <div>
                            <h3 className="font-bold text-charcoal mb-4">Pedicure Services</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {Object.keys(menu.pedicurePrices).map((type) => (
                                    <div key={type} className="bg-gray-50 p-4 rounded-xl flex justify-between items-center">
                                        <span className="font-medium text-charcoal">{type}</span>
                                        <div className="relative w-24">
                                            <DollarSign size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
                                            <input
                                                type="number"
                                                value={menu.pedicurePrices[type as PedicureType]}
                                                onChange={(e) => store.updatePedicurePrice(type as PedicureType, Number(e.target.value))}
                                                className="w-full pl-8 pr-4 py-2 bg-white rounded-lg border border-gray-200 text-right font-bold text-charcoal focus:outline-none focus:border-pink-500"
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

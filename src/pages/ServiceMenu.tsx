import { useState } from 'react';
import { useServiceStore } from '../store/useServiceStore';
import { RotateCcw, DollarSign, Tag, Sparkles, AlertCircle } from 'lucide-react';
import type { SystemType, NailLength, FinishType, SpecialtyEffect, ClassicDesign, ArtLevel, BlingDensity, ForeignWork, PedicureType } from '../types/serviceSchema';

export default function ServiceMenu() {
    const store = useServiceStore();
    const { menu, resetMenu } = store;
    const [activeTab, setActiveTab] = useState<'base' | 'addons' | 'art' | 'modifiers' | 'pedicure'>('base');

    return (
        <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-charcoal font-display">Service Menu</h1>
                    <p className="text-gray-600">Customize your prices for the new Pricing Engine.</p>
                </div>
                <button
                    onClick={() => {
                        if (window.confirm('Are you sure you want to reset to default prices? This cannot be undone.')) {
                            resetMenu();
                        }
                    }}
                    className="flex items-center px-4 py-2 text-sm text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                >
                    <RotateCcw size={16} className="mr-2" />
                    Reset Defaults
                </button>
            </div>

            {/* Tabs */}
            <div className="flex space-x-1 bg-gray-100 p-1 rounded-xl w-fit overflow-x-auto">
                {(['base', 'addons', 'art', 'modifiers', 'pedicure'] as const).map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-6 py-2 rounded-lg text-sm font-bold capitalize whitespace-nowrap transition-all ${activeTab === tab ? 'bg-white text-charcoal shadow-sm' : 'text-gray-500 hover:text-charcoal'}`}
                    >
                        {tab === 'art' ? 'Art & Bling' : tab}
                    </button>
                ))}
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {activeTab === 'base' && (
                    <div className="p-6 space-y-8">
                        {/* Base Prices */}
                        <div>
                            <h3 className="font-bold text-charcoal mb-4 flex items-center">
                                <Tag size={18} className="mr-2 text-pink-500" />
                                Base System Prices
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
                                                className="w-full pl-6 py-1 bg-white rounded-lg border border-gray-200 text-right font-bold text-charcoal focus:outline-none focus:border-pink-500"
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Length Surcharges */}
                        <div>
                            <h3 className="font-bold text-charcoal mb-4 flex items-center">
                                <Tag size={18} className="mr-2 text-pink-500" />
                                Length Surcharges
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
                                                className="w-full pl-6 py-1 bg-white rounded-lg border border-gray-200 text-center font-bold text-charcoal focus:outline-none focus:border-pink-500"
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
                        {/* Finish */}
                        <div>
                            <h3 className="font-bold text-charcoal mb-4">Finish Surcharges</h3>
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
                                                className="w-full pl-6 py-1 bg-white rounded-lg border border-gray-200 text-right font-bold text-charcoal focus:outline-none focus:border-pink-500"
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Specialty Effects */}
                        <div>
                            <h3 className="font-bold text-charcoal mb-4">Specialty Effects</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {Object.keys(menu.specialtySurcharges).map((eff) => (
                                    <div key={eff} className="bg-gray-50 p-4 rounded-xl flex justify-between items-center">
                                        <span className="font-medium text-charcoal">{eff}</span>
                                        <div className="relative w-24">
                                            <DollarSign size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
                                            <input
                                                type="number"
                                                value={menu.specialtySurcharges[eff as SpecialtyEffect]}
                                                onChange={(e) => store.updateSpecialtySurcharge(eff as SpecialtyEffect, Number(e.target.value))}
                                                className="w-full pl-6 py-1 bg-white rounded-lg border border-gray-200 text-right font-bold text-charcoal focus:outline-none focus:border-pink-500"
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Classic Design */}
                        <div>
                            <h3 className="font-bold text-charcoal mb-4">Classic Design</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {Object.keys(menu.classicDesignSurcharges).map((des) => (
                                    <div key={des} className="bg-gray-50 p-4 rounded-xl flex justify-between items-center">
                                        <span className="font-medium text-charcoal">{des}</span>
                                        <div className="relative w-24">
                                            <DollarSign size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
                                            <input
                                                type="number"
                                                value={menu.classicDesignSurcharges[des as ClassicDesign]}
                                                onChange={(e) => store.updateClassicDesignSurcharge(des as ClassicDesign, Number(e.target.value))}
                                                className="w-full pl-6 py-1 bg-white rounded-lg border border-gray-200 text-right font-bold text-charcoal focus:outline-none focus:border-pink-500"
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
                            <h3 className="font-bold text-charcoal mb-4 flex items-center">
                                <Sparkles size={18} className="mr-2 text-pink-500" />
                                Art Complexity Levels
                            </h3>
                            <div className="space-y-4">
                                {Object.keys(menu.artLevelPrices).map((level) => (
                                    <div key={level} className="bg-gray-50 p-4 rounded-xl flex justify-between items-center">
                                        <div>
                                            <span className="font-bold text-charcoal block">{level}</span>
                                            <span className="text-xs text-gray-500">
                                                {level === 'Level 1' && 'Simple lines, dots, foil'}
                                                {level === 'Level 2' && 'Marble, blooming gel, simple hand-drawn'}
                                                {level === 'Level 3' && 'Intricate hand-drawn, Anime'}
                                                {level === 'Level 4' && 'Encapsulated, 3D clay, mixed media'}
                                            </span>
                                        </div>
                                        <div className="relative w-24">
                                            <DollarSign size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
                                            <input
                                                type="number"
                                                value={menu.artLevelPrices[level as ArtLevel]}
                                                onChange={(e) => store.updateArtLevelPrice(level as ArtLevel, Number(e.target.value))}
                                                className="w-full pl-6 py-1 bg-white rounded-lg border border-gray-200 text-right font-bold text-charcoal focus:outline-none focus:border-pink-500"
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
                                                className="w-full pl-6 py-1 bg-white rounded-lg border border-gray-200 text-right font-bold text-charcoal focus:outline-none focus:border-pink-500"
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Unit Prices */}
                        <div>
                            <h3 className="font-bold text-charcoal mb-4">Unit Prices</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="bg-gray-50 p-4 rounded-xl flex justify-between items-center">
                                    <span className="font-medium text-charcoal">XL Charms (Each)</span>
                                    <div className="relative w-24">
                                        <DollarSign size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <input
                                            type="number"
                                            value={menu.unitPrices.xlCharms}
                                            onChange={(e) => store.updateUnitPrice('xlCharms', Number(e.target.value))}
                                            className="w-full pl-6 py-1 bg-white rounded-lg border border-gray-200 text-right font-bold text-charcoal focus:outline-none focus:border-pink-500"
                                        />
                                    </div>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-xl flex justify-between items-center">
                                    <span className="font-medium text-charcoal">Piercings (Each)</span>
                                    <div className="relative w-24">
                                        <DollarSign size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <input
                                            type="number"
                                            value={menu.unitPrices.piercings}
                                            onChange={(e) => store.updateUnitPrice('piercings', Number(e.target.value))}
                                            className="w-full pl-6 py-1 bg-white rounded-lg border border-gray-200 text-right font-bold text-charcoal focus:outline-none focus:border-pink-500"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'modifiers' && (
                    <div className="p-6 space-y-8">
                        {/* Foreign Work */}
                        <div>
                            <h3 className="font-bold text-charcoal mb-4 flex items-center">
                                <AlertCircle size={18} className="mr-2 text-orange-500" />
                                Foreign Work Surcharges
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {Object.keys(menu.modifierSurcharges).map((mod) => (
                                    <div key={mod} className="bg-gray-50 p-4 rounded-xl flex justify-between items-center">
                                        <span className="font-medium text-charcoal">{mod}</span>
                                        <div className="relative w-24">
                                            <DollarSign size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
                                            <input
                                                type="number"
                                                value={menu.modifierSurcharges[mod as ForeignWork]}
                                                onChange={(e) => store.updateModifierSurcharge(mod as ForeignWork, Number(e.target.value))}
                                                className="w-full pl-6 py-1 bg-white rounded-lg border border-gray-200 text-right font-bold text-charcoal focus:outline-none focus:border-pink-500"
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Repairs & Soak Off */}
                        <div>
                            <h3 className="font-bold text-charcoal mb-4">Other Services</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="bg-gray-50 p-4 rounded-xl flex justify-between items-center">
                                    <span className="font-medium text-charcoal">Repairs (Per Nail)</span>
                                    <div className="relative w-24">
                                        <DollarSign size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <input
                                            type="number"
                                            value={menu.unitPrices.repairs}
                                            onChange={(e) => store.updateUnitPrice('repairs', Number(e.target.value))}
                                            className="w-full pl-6 py-1 bg-white rounded-lg border border-gray-200 text-right font-bold text-charcoal focus:outline-none focus:border-pink-500"
                                        />
                                    </div>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-xl flex justify-between items-center">
                                    <span className="font-medium text-charcoal">Soak Off Only</span>
                                    <div className="relative w-24">
                                        <DollarSign size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <input
                                            type="number"
                                            value={menu.unitPrices.soakOff}
                                            onChange={(e) => store.updateUnitPrice('soakOff', Number(e.target.value))}
                                            className="w-full pl-6 py-1 bg-white rounded-lg border border-gray-200 text-right font-bold text-charcoal focus:outline-none focus:border-pink-500"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'pedicure' && (
                    <div className="p-6 space-y-8">
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
                                                className="w-full pl-6 py-1 bg-white rounded-lg border border-gray-200 text-right font-bold text-charcoal focus:outline-none focus:border-pink-500"
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

import { useState } from 'react';
import { useServiceStore } from '../store/useServiceStore';
import { DollarSign, Tag, Info, Trash2, Plus, X } from 'lucide-react';
import type { SystemType, NailLength, FinishType, ArtLevel, BlingDensity, ForeignWork, PedicureType, MasterServiceMenu, SpecialtyEffect } from '../types/serviceSchema';

export default function ServiceMenuEditor() {
    const store = useServiceStore();
    const { menu } = store;
    const [activeTab, setActiveTab] = useState<'base' | 'addons' | 'art' | 'modifiers' | 'pedicure'>('base');
    const [addingItem, setAddingItem] = useState<{ category: keyof MasterServiceMenu; key: string; price: string; duration: string } | null>(null);

    if (!menu || !menu.basePrices) return null;

    const handleDelete = (category: keyof MasterServiceMenu, key: string) => {
        if (confirm(`Are you sure you want to delete "${key}"? This may affect existing bookings.`)) {
            store.removeItem(category, key);
        }
    };

    const handleAdd = () => {
        if (addingItem && addingItem.key && addingItem.price) {
            store.addItem(addingItem.category, addingItem.key, Number(addingItem.price), Number(addingItem.duration));
            setAddingItem(null);
        }
    };

    const renderAddItemForm = (category: keyof MasterServiceMenu, placeholder: string) => {
        if (addingItem?.category !== category) {
            return (
                <button
                    onClick={() => setAddingItem({ category, key: '', price: '', duration: '0' })}
                    className="flex items-center text-sm font-bold text-pink-500 hover:text-pink-600 mt-4"
                >
                    <Plus size={16} className="mr-1" /> Add Item
                </button>
            );
        }

        return (
            <div className="bg-pink-50 p-4 rounded-xl mt-4 border border-pink-100 animate-in fade-in slide-in-from-top-2">
                <div className="flex gap-2 mb-2">
                    <input
                        type="text"
                        placeholder={placeholder}
                        value={addingItem.key}
                        onChange={(e) => setAddingItem({ ...addingItem, key: e.target.value })}
                        className="flex-1 p-2 rounded-lg border border-pink-200 text-sm focus:outline-none focus:border-pink-500"
                        autoFocus
                    />
                    <input
                        type="number"
                        min="0"
                        placeholder="Price"
                        value={addingItem.price}
                        onChange={(e) => setAddingItem({ ...addingItem, price: e.target.value })}
                        className="w-24 p-2 rounded-lg border border-pink-200 text-sm focus:outline-none focus:border-pink-500"
                    />
                    <input
                        type="number"
                        min="0"
                        placeholder="Mins"
                        value={addingItem.duration}
                        onChange={(e) => setAddingItem({ ...addingItem, duration: e.target.value })}
                        className="w-20 p-2 rounded-lg border border-pink-200 text-sm focus:outline-none focus:border-pink-500"
                        title="Duration in minutes"
                    />
                </div>
                <div className="flex justify-end gap-2">
                    <button
                        onClick={() => setAddingItem(null)}
                        className="px-3 py-1 text-xs font-bold text-gray-500 hover:text-gray-700"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleAdd}
                        disabled={!addingItem.key || !addingItem.price}
                        className="px-3 py-1 bg-pink-500 text-white rounded-lg text-xs font-bold hover:bg-pink-600 disabled:opacity-50"
                    >
                        Save
                    </button>
                </div>
            </div>
        );
    };

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
                                    <div key={sys} className="bg-gray-50 p-4 rounded-xl flex justify-between items-center group">
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => handleDelete('basePrices', sys)}
                                                className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                                title="Delete Item"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                            <span className="font-medium text-charcoal">{sys}</span>
                                        </div>
                                        <div className="relative w-24">
                                            <DollarSign size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
                                            <input
                                                type="number"
                                                min="0"
                                                value={menu.basePrices[sys as SystemType]}
                                                onChange={(e) => store.updateBasePrice(sys as SystemType, Number(e.target.value))}
                                                className="w-full pl-8 pr-4 py-2 bg-white rounded-lg border border-gray-200 text-right font-bold text-charcoal focus:outline-none focus:border-pink-500"
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                            {renderAddItemForm('basePrices', 'New System Name (e.g. Dip Powder)')}
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
                                    <div key={len} className="bg-gray-50 p-4 rounded-xl text-center group relative">
                                        <button
                                            onClick={() => handleDelete('lengthSurcharges', len)}
                                            className="absolute top-2 right-2 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                            title="Delete Item"
                                        >
                                            <X size={12} />
                                        </button>
                                        <div className="text-sm font-bold text-gray-500 mb-2">{len}</div>
                                        <div className="relative inline-block w-20">
                                            <DollarSign size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
                                            <input
                                                type="number"
                                                min="0"
                                                value={menu.lengthSurcharges[len as NailLength]}
                                                onChange={(e) => store.updateLengthSurcharge(len as NailLength, Number(e.target.value))}
                                                className="w-full pl-6 pr-2 py-1 bg-white rounded border border-gray-200 text-right font-bold text-sm focus:outline-none focus:border-pink-500"
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                            {renderAddItemForm('lengthSurcharges', 'New Length (e.g. XXXL)')}
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
                                    <div key={finish} className="bg-gray-50 p-4 rounded-xl flex justify-between items-center group">
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => handleDelete('finishSurcharges', finish)}
                                                className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                            <span className="font-medium text-charcoal">{finish}</span>
                                        </div>
                                        <div className="relative w-24">
                                            <DollarSign size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
                                            <input
                                                type="number"
                                                min="0"
                                                value={menu.finishSurcharges[finish as FinishType]}
                                                onChange={(e) => store.updateFinishSurcharge(finish as FinishType, Number(e.target.value))}
                                                className="w-full pl-8 pr-4 py-2 bg-white rounded-lg border border-gray-200 text-right font-bold text-charcoal focus:outline-none focus:border-pink-500"
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                            {renderAddItemForm('finishSurcharges', 'New Finish (e.g. Velvet)')}
                        </div>
                        {/* Specialty Effects */}
                        <div>
                            <h3 className="font-bold text-charcoal mb-4">Specialty Effects</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {Object.keys(menu.specialtySurcharges).map((effect) => (
                                    <div key={effect} className="bg-gray-50 p-4 rounded-xl flex justify-between items-center group">
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => handleDelete('specialtySurcharges', effect)}
                                                className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                            <span className="font-medium text-charcoal">{effect}</span>
                                        </div>
                                        <div className="relative w-24">
                                            <DollarSign size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
                                            <input
                                                type="number"
                                                min="0"
                                                value={menu.specialtySurcharges[effect as SpecialtyEffect]}
                                                onChange={(e) => store.updateSpecialtySurcharge(effect as SpecialtyEffect, Number(e.target.value))}
                                                className="w-full pl-8 pr-4 py-2 bg-white rounded-lg border border-gray-200 text-right font-bold text-charcoal focus:outline-none focus:border-pink-500"
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                            {renderAddItemForm('specialtySurcharges', 'New Effect (e.g. Aura)')}
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
                                    <div key={level} className="bg-gray-50 p-4 rounded-xl flex justify-between items-center group">
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => handleDelete('artLevelPrices', level)}
                                                className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                            <span className="font-medium text-charcoal">{level}</span>
                                        </div>
                                        <div className="relative w-24">
                                            <DollarSign size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
                                            <input
                                                type="number"
                                                min="0"
                                                value={menu.artLevelPrices[level as ArtLevel]}
                                                onChange={(e) => store.updateArtLevelPrice(level as ArtLevel, Number(e.target.value))}
                                                className="w-full pl-8 pr-4 py-2 bg-white rounded-lg border border-gray-200 text-right font-bold text-charcoal focus:outline-none focus:border-pink-500"
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                            {renderAddItemForm('artLevelPrices', 'New Level (e.g. Level 5)')}
                        </div>
                        {/* Bling Density */}
                        <div>
                            <h3 className="font-bold text-charcoal mb-4">Bling Density</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {Object.keys(menu.blingDensityPrices).map((density) => (
                                    <div key={density} className="bg-gray-50 p-4 rounded-xl flex justify-between items-center group">
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => handleDelete('blingDensityPrices', density)}
                                                className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                            <span className="font-medium text-charcoal">{density}</span>
                                        </div>
                                        <div className="relative w-24">
                                            <DollarSign size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
                                            <input
                                                type="number"
                                                min="0"
                                                value={menu.blingDensityPrices[density as BlingDensity]}
                                                onChange={(e) => store.updateBlingDensityPrice(density as BlingDensity, Number(e.target.value))}
                                                className="w-full pl-8 pr-4 py-2 bg-white rounded-lg border border-gray-200 text-right font-bold text-charcoal focus:outline-none focus:border-pink-500"
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                            {renderAddItemForm('blingDensityPrices', 'New Density (e.g. Extreme)')}
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
                                    <div key={work} className="bg-gray-50 p-4 rounded-xl flex justify-between items-center group">
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => handleDelete('modifierSurcharges', work)}
                                                className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                            <span className="font-medium text-charcoal">{work}</span>
                                        </div>
                                        <div className="relative w-24">
                                            <DollarSign size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
                                            <input
                                                type="number"
                                                min="0"
                                                value={menu.modifierSurcharges[work as ForeignWork]}
                                                onChange={(e) => store.updateModifierSurcharge(work as ForeignWork, Number(e.target.value))}
                                                className="w-full pl-8 pr-4 py-2 bg-white rounded-lg border border-gray-200 text-right font-bold text-charcoal focus:outline-none focus:border-pink-500"
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                            {renderAddItemForm('modifierSurcharges', 'New Modifier (e.g. Late Fee)')}
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
                                    <div key={type} className="bg-gray-50 p-4 rounded-xl flex justify-between items-center group">
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => handleDelete('pedicurePrices', type)}
                                                className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                            <span className="font-medium text-charcoal">{type}</span>
                                        </div>
                                        <div className="relative w-24">
                                            <DollarSign size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
                                            <input
                                                type="number"
                                                min="0"
                                                value={menu.pedicurePrices[type as PedicureType]}
                                                onChange={(e) => store.updatePedicurePrice(type as PedicureType, Number(e.target.value))}
                                                className="w-full pl-8 pr-4 py-2 bg-white rounded-lg border border-gray-200 text-right font-bold text-charcoal focus:outline-none focus:border-pink-500"
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                            {renderAddItemForm('pedicurePrices', 'New Pedi Type (e.g. Deluxe)')}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

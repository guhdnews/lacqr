import { useEffect, useState } from 'react';
import { useServiceStore } from '../store/useServiceStore';
import { calculatePrice, calculateDuration } from '../utils/pricingCalculator';
import type { ServiceSelection, SystemType, NailLength, FinishType, SpecialtyEffect, ClassicDesign, ArtLevel, BlingDensity, ForeignWork, PedicureType } from '../types/serviceSchema';
import { Sparkles, AlertCircle, Clock } from 'lucide-react';

interface ServiceConfiguratorProps {
    initialSelection: ServiceSelection;
    onUpdate?: (selection: ServiceSelection) => void;
}

export default function ServiceConfigurator({ initialSelection, onUpdate }: ServiceConfiguratorProps) {
    const { menu } = useServiceStore();
    const [selection, setSelection] = useState<ServiceSelection>(initialSelection);
    const [price, setPrice] = useState(0);
    const [duration, setDuration] = useState(0);

    // Recalculate price and duration whenever selection or menu changes
    useEffect(() => {
        const newPrice = calculatePrice(selection, menu);
        const newDuration = calculateDuration(selection, menu);
        setPrice(newPrice);
        setDuration(newDuration);
        if (onUpdate) {
            onUpdate(selection);
        }
    }, [selection, menu, onUpdate]);

    const updateBase = (field: keyof ServiceSelection['base'], value: any) => {
        setSelection(prev => ({ ...prev, base: { ...prev.base, [field]: value } }));
    };

    const updateAddons = (field: keyof ServiceSelection['addons'], value: any) => {
        setSelection(prev => ({ ...prev, addons: { ...prev.addons, [field]: value } }));
    };

    const updateArt = (level: ArtLevel | null) => {
        setSelection(prev => ({ ...prev, art: { ...prev.art, level } }));
    };

    const updateBling = (field: keyof ServiceSelection['bling'], value: any) => {
        setSelection(prev => ({ ...prev, bling: { ...prev.bling, [field]: value } }));
    };

    const updateModifiers = (field: keyof ServiceSelection['modifiers'], value: any) => {
        setSelection(prev => ({ ...prev, modifiers: { ...prev.modifiers, [field]: value } }));
    };

    const updatePedicure = (field: keyof ServiceSelection['pedicure'], value: any) => {
        setSelection(prev => ({ ...prev, pedicure: { ...prev.pedicure, [field]: value } }));
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Header / Price Display */}
            <div className="bg-charcoal text-white p-6 flex justify-between items-center sticky top-0 z-10">
                <div>
                    <h2 className="text-xl font-bold font-display">Service Configuration</h2>
                    <p className="text-gray-400 text-sm">Customize your set details</p>
                </div>
                <div className="text-right">
                    <div className="text-3xl font-bold font-display flex items-center justify-end">
                        <span className="text-gray-400 text-lg mr-1">$</span>
                        {price.toFixed(2)}
                    </div>
                    <div className="flex items-center justify-end text-gray-400 text-xs uppercase tracking-wider mt-1">
                        <Clock className="w-3 h-3 mr-1" />
                        {Math.floor(duration / 60)}h {duration % 60}m
                    </div>
                </div>
            </div>

            <div className="p-6 space-y-8">
                {/* AI Description (if available) */}
                {selection.aiDescription && (
                    <div className="bg-purple-50 p-4 rounded-xl border border-purple-100 mb-6">
                        <div className="flex items-start gap-3">
                            <Sparkles className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                            <div>
                                <h4 className="font-bold text-purple-900 text-sm uppercase tracking-wide mb-1">AI Analysis</h4>
                                <p className="text-purple-800 text-sm leading-relaxed">{selection.aiDescription}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Itemized Breakdown (Restored) */}
                {selection.pricingDetails && (
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 mb-6">
                        <h4 className="font-bold text-gray-900 text-sm uppercase tracking-wide mb-3">Price Breakdown</h4>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Base Set</span>
                                <span className="font-medium">${selection.pricingDetails.breakdown.basePrice}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Length ({selection.pricingDetails.details.lengthTier})</span>
                                <span className="font-medium">+${selection.pricingDetails.breakdown.lengthCharge}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Art ({selection.pricingDetails.details.artTier})</span>
                                <span className="font-medium">+${selection.pricingDetails.breakdown.artTierCharge}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Bling ({selection.pricingDetails.details.densityTier})</span>
                                <span className="font-medium">+${selection.pricingDetails.breakdown.densityCharge}</span>
                            </div>
                            {selection.pricingDetails.breakdown.materialCharge > 0 && (
                                <div className="flex justify-between text-purple-600">
                                    <span>Premium Materials</span>
                                    <span className="font-medium">+${selection.pricingDetails.breakdown.materialCharge}</span>
                                </div>
                            )}
                            <div className="pt-2 mt-2 border-t border-gray-200 flex justify-between font-bold">
                                <span>Total Estimate</span>
                                <span>${selection.pricingDetails.totalPrice}</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* 1. Base Service */}
                <section>
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Base Service</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">System</label>
                            <select
                                value={selection.base.system}
                                onChange={(e) => updateBase('system', e.target.value)}
                                className="w-full p-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-pink-500"
                            >
                                {Object.keys(menu.basePrices).map(sys => (
                                    <option key={sys} value={sys}>{sys} (${menu.basePrices[sys as SystemType]})</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Length</label>
                            <select
                                value={selection.base.length}
                                onChange={(e) => updateBase('length', e.target.value)}
                                className="w-full p-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-pink-500"
                            >
                                {Object.keys(menu.lengthSurcharges).map(len => (
                                    <option key={len} value={len}>{len} (+${menu.lengthSurcharges[len as NailLength]})</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </section>

                <hr className="border-gray-100" />

                {/* Appointment Details */}
                <section>
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Appointment Details</h3>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Requested Time</label>
                        <input
                            type="datetime-local"
                            value={selection.appointmentTime || ''}
                            onChange={(e) => setSelection(prev => ({ ...prev, appointmentTime: e.target.value }))}
                            className="w-full p-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-pink-500"
                        />
                    </div>
                </section>

                {/* 2. Add-ons */}
                <section>
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Add-ons & Finish</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Finish</label>
                            <div className="flex space-x-2">
                                {Object.keys(menu.finishSurcharges).map(finish => (
                                    <button
                                        key={finish}
                                        onClick={() => updateAddons('finish', finish)}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${selection.addons.finish === finish ? 'bg-pink-100 text-pink-700 border border-pink-200' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}
                                    >
                                        {finish} {menu.finishSurcharges[finish as FinishType] > 0 && `(+$${menu.finishSurcharges[finish as FinishType]})`}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Specialty Effect</label>
                            <select
                                value={selection.addons.specialtyEffect}
                                onChange={(e) => updateAddons('specialtyEffect', e.target.value)}
                                className="w-full p-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-pink-500"
                            >
                                {Object.keys(menu.specialtySurcharges).map(eff => (
                                    <option key={eff} value={eff}>{eff} (+${menu.specialtySurcharges[eff as SpecialtyEffect]})</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Classic Design</label>
                            <select
                                value={selection.addons.classicDesign}
                                onChange={(e) => updateAddons('classicDesign', e.target.value)}
                                className="w-full p-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-pink-500"
                            >
                                {Object.keys(menu.classicDesignSurcharges).map(des => (
                                    <option key={des} value={des}>{des} (+${menu.classicDesignSurcharges[des as ClassicDesign]})</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </section>

                <hr className="border-gray-100" />

                {/* 3. Art Complexity */}
                <section>
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center">
                        <Sparkles size={16} className="mr-2 text-pink-500" />
                        Art Complexity
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                        <button
                            onClick={() => updateArt(null)}
                            className={`p-3 rounded-xl border-2 text-center transition-all ${selection.art.level === null ? 'border-pink-500 bg-pink-50 text-pink-700' : 'border-transparent bg-gray-50 text-gray-600 hover:bg-gray-100'}`}
                        >
                            <div className="font-bold text-sm">None</div>
                            <div className="text-xs opacity-70">No Art</div>
                        </button>
                        {Object.keys(menu.artLevelPrices).map(level => (
                            <button
                                key={level}
                                onClick={() => updateArt(level as ArtLevel)}
                                className={`p-3 rounded-xl border-2 text-center transition-all ${selection.art.level === level ? 'border-pink-500 bg-pink-50 text-pink-700' : 'border-transparent bg-gray-50 text-gray-600 hover:bg-gray-100'}`}
                            >
                                <div className="font-bold text-sm">{level}</div>
                                <div className="text-xs opacity-70">+${menu.artLevelPrices[level as ArtLevel]}</div>
                            </button>
                        ))}
                    </div>
                </section>

                <hr className="border-gray-100" />

                {/* 4. Bling & Hardware */}
                <section>
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Bling & Hardware</h3>
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Crystal Density</label>
                            <div className="flex flex-wrap gap-2">
                                {Object.keys(menu.blingDensityPrices).map(density => (
                                    <button
                                        key={density}
                                        onClick={() => updateBling('density', density)}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${selection.bling.density === density ? 'bg-purple-100 text-purple-700 border border-purple-200' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}
                                    >
                                        {density} (+${menu.blingDensityPrices[density as BlingDensity]})
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">XL Charms (Qty)</label>
                                <div className="flex items-center space-x-3">
                                    <button
                                        onClick={() => updateBling('xlCharmsCount', Math.max(0, selection.bling.xlCharmsCount - 1))}
                                        className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200"
                                    >-</button>
                                    <span className="font-bold w-8 text-center">{selection.bling.xlCharmsCount}</span>
                                    <button
                                        onClick={() => updateBling('xlCharmsCount', selection.bling.xlCharmsCount + 1)}
                                        className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200"
                                    >+</button>
                                    <span className="text-xs text-gray-400">(${menu.unitPrices.xlCharms}/ea)</span>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Piercings (Qty)</label>
                                <div className="flex items-center space-x-3">
                                    <button
                                        onClick={() => updateBling('piercingsCount', Math.max(0, selection.bling.piercingsCount - 1))}
                                        className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200"
                                    >-</button>
                                    <span className="font-bold w-8 text-center">{selection.bling.piercingsCount}</span>
                                    <button
                                        onClick={() => updateBling('piercingsCount', selection.bling.piercingsCount + 1)}
                                        className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200"
                                    >+</button>
                                    <span className="text-xs text-gray-400">(${menu.unitPrices.piercings}/ea)</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <hr className="border-gray-100" />

                {/* 5. Modifiers */}
                <section>
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center">
                        <AlertCircle size={16} className="mr-2 text-orange-500" />
                        Modifiers
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Foreign Work</label>
                            <select
                                value={selection.modifiers.foreignWork}
                                onChange={(e) => updateModifiers('foreignWork', e.target.value)}
                                className="w-full p-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-orange-500"
                            >
                                {Object.keys(menu.modifierSurcharges).map(mod => (
                                    <option key={mod} value={mod}>{mod} (+${menu.modifierSurcharges[mod as ForeignWork]})</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Repairs (Qty)</label>
                            <div className="flex items-center space-x-3">
                                <button
                                    onClick={() => updateModifiers('repairsCount', Math.max(0, selection.modifiers.repairsCount - 1))}
                                    className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200"
                                >-</button>
                                <span className="font-bold w-8 text-center">{selection.modifiers.repairsCount}</span>
                                <button
                                    onClick={() => updateModifiers('repairsCount', selection.modifiers.repairsCount + 1)}
                                    className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200"
                                >+</button>
                                <span className="text-xs text-gray-400">(${menu.unitPrices.repairs}/nail)</span>
                            </div>
                        </div>
                    </div>
                    <div className="mt-4">
                        <label className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
                            <input
                                type="checkbox"
                                checked={selection.modifiers.soakOffOnly}
                                onChange={(e) => updateModifiers('soakOffOnly', e.target.checked)}
                                className="w-5 h-5 text-pink-500 rounded focus:ring-pink-500 border-gray-300"
                            />
                            <span className="font-medium text-gray-700">Soak Off Only (No Service) (+${menu.unitPrices.soakOff})</span>
                        </label>
                    </div>
                </section>

                <hr className="border-gray-100" />

                {/* 6. Pedicure */}
                <section>
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Pedicure</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Service Type</label>
                            <select
                                value={selection.pedicure.type}
                                onChange={(e) => updatePedicure('type', e.target.value)}
                                className="w-full p-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-blue-500"
                            >
                                {Object.keys(menu.pedicurePrices).map(type => (
                                    <option key={type} value={type}>{type} (+${menu.pedicurePrices[type as PedicureType]})</option>
                                ))}
                            </select>
                        </div>
                        {selection.pedicure.type !== 'None' && (
                            <div className="flex items-center">
                                <label className="flex items-center space-x-3 p-3 bg-blue-50 rounded-xl cursor-pointer hover:bg-blue-100 transition-colors w-full">
                                    <input
                                        type="checkbox"
                                        checked={selection.pedicure.toeArtMatch}
                                        onChange={(e) => updatePedicure('toeArtMatch', e.target.checked)}
                                        className="w-5 h-5 text-blue-500 rounded focus:ring-blue-500 border-gray-300"
                                    />
                                    <div>
                                        <span className="font-medium text-blue-900 block">Match Hand Art?</span>
                                        <span className="text-xs text-blue-700">Adds 50% of Hand Art Price</span>
                                    </div>
                                </label>
                            </div>
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
}

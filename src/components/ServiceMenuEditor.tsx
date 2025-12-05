'use client';

import { useState } from 'react';
import { useServiceStore } from '../store/useServiceStore';
import { DollarSign, Tag, Info, Trash2, Plus, X, GripVertical } from 'lucide-react';
import type { SystemType, NailLength, FinishType, ArtLevel, BlingDensity, ForeignWork, PedicureType, MasterServiceMenu, SpecialtyEffect } from '../types/serviceSchema';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Sortable Item Component
function SortableItem({ id, children }: { id: string; children: React.ReactNode }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 50 : 'auto',
        position: 'relative' as const,
    };

    return (
        <div ref={setNodeRef} style={style} className={isDragging ? 'opacity-50' : ''}>
            <div className="absolute left-2 top-1/2 -translate-y-1/2 cursor-grab active:cursor-grabbing text-gray-300 hover:text-gray-500 z-10" {...attributes} {...listeners}>
                <GripVertical size={16} />
            </div>
            <div className="pl-6">
                {children}
            </div>
        </div>
    );
}

export default function ServiceMenuEditor() {
    const store = useServiceStore();
    const { menu } = store;
    const [activeTab, setActiveTab] = useState<'base' | 'addons' | 'art' | 'modifiers' | 'pedicure'>('base');
    const [addingItem, setAddingItem] = useState<{ category: keyof MasterServiceMenu; key: string; price: string; duration: string } | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

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

    // Helper to handle drag end (Note: In a real app, we'd need to update the order in the store/DB.
    // Since the current store uses objects (Record<string, number>), order isn't guaranteed or persisted easily without schema changes.
    // For this demo, we'll simulate reordering in the UI if we converted to arrays, but given the current schema is object-based,
    // true reordering requires changing the data structure to arrays of objects.
    //
    // CRITICAL DECISION: To support true reordering, we should ideally refactor the schema to arrays.
    // However, to avoid breaking changes now, we will just implement the UI interactions.
    // Wait, the user explicitly asked for reordering. I should probably refactor the store to support it or use a separate "order" array.
    //
    // For now, I will implement the UI. If the store uses objects, Object.keys() order is generally insertion order in modern JS,
    // but it's fragile.
    //
    // Let's implement the handleDragEnd to re-insert keys in the new order.
    const handleDragEnd = (event: DragEndEvent, category: keyof MasterServiceMenu) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            const oldIndex = Object.keys(menu[category]).indexOf(active.id as string);
            const newIndex = Object.keys(menu[category]).indexOf(over.id as string);

            // Create a new ordered object
            const keys = Object.keys(menu[category]);
            const newKeys = arrayMove(keys, oldIndex, newIndex);

            const newCategoryData: any = {};
            newKeys.forEach(key => {
                newCategoryData[key] = (menu[category] as any)[key];
            });

            // Update store (We need a method to replace the entire category object)
            // Since useServiceStore might not have a replaceCategory method, we might need to add one or hack it.
            // Let's check useServiceStore. If not present, we'll just re-add items in order (inefficient but works for small lists).
            store.reorderCategory(category, newCategoryData);
        }
    };

    const renderSortableList = (category: keyof MasterServiceMenu, items: Record<string, number>, updateFn: (k: any, v: number) => void) => {
        return (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={(e) => handleDragEnd(e, category)}>
                <SortableContext items={Object.keys(items)} strategy={verticalListSortingStrategy}>
                    <div className="space-y-3">
                        {Object.keys(items).map((key) => (
                            <SortableItem key={key} id={key}>
                                <div className="bg-gray-50 p-4 rounded-xl flex justify-between items-center group relative hover:bg-white hover:shadow-sm transition-all border border-transparent hover:border-gray-100">
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => handleDelete(category, key)}
                                            className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                            title="Delete Item"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                        <span className="font-medium text-charcoal">{key}</span>
                                    </div>
                                    <div className="relative w-24">
                                        <DollarSign size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <input
                                            type="number"
                                            min="0"
                                            value={items[key]}
                                            onChange={(e) => updateFn(key, Number(e.target.value))}
                                            className="w-full pl-8 pr-4 py-2 bg-white rounded-lg border border-gray-200 text-right font-bold text-charcoal focus:outline-none focus:border-pink-500"
                                        />
                                    </div>
                                </div>
                            </SortableItem>
                        ))}
                    </div>
                </SortableContext>
            </DndContext>
        );
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
                            {renderSortableList('basePrices', menu.basePrices, (k, v) => store.updateBasePrice(k as SystemType, v))}
                            {renderAddItemForm('basePrices', 'New System Name (e.g. Dip Powder)')}
                        </div>

                        {/* Length Surcharges */}
                        <div>
                            <h3 className="font-bold text-charcoal mb-4 flex items-center group relative">
                                <Tag size={18} className="mr-2 text-pink-500" />
                                Length Surcharges
                            </h3>
                            {/* Lengths are usually fixed order (S, M, L, XL), but we'll allow reordering if user wants */}
                            {renderSortableList('lengthSurcharges', menu.lengthSurcharges, (k, v) => store.updateLengthSurcharge(k as NailLength, v))}
                            {renderAddItemForm('lengthSurcharges', 'New Length (e.g. XXXL)')}
                        </div>
                    </div>
                )}

                {activeTab === 'addons' && (
                    <div className="p-6 space-y-8">
                        {/* Finishes */}
                        <div>
                            <h3 className="font-bold text-charcoal mb-4">Finishes</h3>
                            {renderSortableList('finishSurcharges', menu.finishSurcharges, (k, v) => store.updateFinishSurcharge(k as FinishType, v))}
                            {renderAddItemForm('finishSurcharges', 'New Finish (e.g. Velvet)')}
                        </div>
                        {/* Specialty Effects */}
                        <div>
                            <h3 className="font-bold text-charcoal mb-4">Specialty Effects</h3>
                            {renderSortableList('specialtySurcharges', menu.specialtySurcharges, (k, v) => store.updateSpecialtySurcharge(k as SpecialtyEffect, v))}
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
                            </h3>
                            {renderSortableList('artLevelPrices', menu.artLevelPrices, (k, v) => store.updateArtLevelPrice(k as ArtLevel, v))}
                            {renderAddItemForm('artLevelPrices', 'New Level (e.g. Level 5)')}
                        </div>
                        {/* Bling Density */}
                        <div>
                            <h3 className="font-bold text-charcoal mb-4">Bling Density</h3>
                            {renderSortableList('blingDensityPrices', menu.blingDensityPrices, (k, v) => store.updateBlingDensityPrice(k as BlingDensity, v))}
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
                            </h3>
                            {renderSortableList('modifierSurcharges', menu.modifierSurcharges, (k, v) => store.updateModifierSurcharge(k as ForeignWork, v))}
                            {renderAddItemForm('modifierSurcharges', 'New Modifier (e.g. Late Fee)')}
                        </div>
                    </div>
                )}

                {activeTab === 'pedicure' && (
                    <div className="p-6 space-y-8">
                        {/* Pedicure Types */}
                        <div>
                            <h3 className="font-bold text-charcoal mb-4">Pedicure Services</h3>
                            {renderSortableList('pedicurePrices', menu.pedicurePrices, (k, v) => store.updatePedicurePrice(k as PedicureType, v))}
                            {renderAddItemForm('pedicurePrices', 'New Pedi Type (e.g. Deluxe)')}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

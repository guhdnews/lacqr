'use client';

import { useState, useRef, useEffect } from 'react';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../lib/firebase';
import { useAppStore } from '../store/useAppStore';
import { useServiceStore } from '../store/useServiceStore';
import { X, Loader2, Camera, Plus, Trash2, DollarSign, Calculator } from 'lucide-react';
import { ProductUsed } from '@/types/serviceRecord';
import type { SystemType, NailLength, FinishType, SpecialtyEffect, ClassicDesign, ArtLevel, BlingDensity, ForeignWork } from '@/types/serviceSchema';

interface ServiceLogModalProps {
    isOpen: boolean;
    onClose: () => void;
    clientId: string;
    onSuccess?: () => void;
    initialData?: any; // For editing
    serviceId?: string; // For editing
}

export default function ServiceLogModal({ isOpen, onClose, clientId, onSuccess, initialData, serviceId }: ServiceLogModalProps) {
    const { user } = useAppStore();
    const { menu } = useServiceStore();

    // Form State
    const [serviceType, setServiceType] = useState<SystemType>('Gel Manicure' as SystemType);
    const [shape, setShape] = useState('Square');
    const [length, setLength] = useState<NailLength>('Short');

    // Add-ons State
    const [finish, setFinish] = useState<FinishType>('Glossy');
    const [specialty, setSpecialty] = useState<SpecialtyEffect>('None');
    const [design, setDesign] = useState<ClassicDesign>('None');
    const [artLevel, setArtLevel] = useState<ArtLevel | 'None'>('None');
    const [bling, setBling] = useState<BlingDensity>('None');
    const [foreignWork, setForeignWork] = useState<ForeignWork>('None');

    const [price, setPrice] = useState('');
    const [tip, setTip] = useState('');
    const [notes, setNotes] = useState('');

    // Products State
    const [products, setProducts] = useState<ProductUsed[]>([]);
    const [newProduct, setNewProduct] = useState({ brand: '', code: '', name: '', category: 'Color' });

    // Photos State
    const [photos, setPhotos] = useState<File[]>([]);
    const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);

    const [submitting, setSubmitting] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Load Initial Data for Editing
    useEffect(() => {
        if (initialData) {
            setServiceType(initialData.serviceType as SystemType || 'Gel Manicure');
            setShape(initialData.shape || 'Square');
            setLength(initialData.length as NailLength || 'Short');
            setPrice(initialData.price?.toString() || '');
            setTip(initialData.tip?.toString() || '');
            setNotes(initialData.techNotes || '');
            setProducts(initialData.productsUsed || []);

            // Load photos if they exist (assuming they are URLs)
            if (initialData.photos?.after) {
                setPhotoPreviews(initialData.photos.after);
            }

            // Parse Add-ons (This is tricky because they are stored as an array of strings)
            // We'll try to match them back to state if possible, or just leave defaults if complex.
            // For now, we'll skip complex reverse-mapping of add-ons to avoid bugs, 
            // as the user can re-select them if needed.
        }
    }, [initialData]);

    // Smart Pricing Logic (Only run if NOT editing or if user changes something)
    // We want to avoid overwriting the stored price when opening edit mode.
    useEffect(() => {
        if (!menu || initialData) return; // Don't auto-calc on edit load

        const basePrice = menu.basePrices[serviceType] || 0;
        const lengthPrice = menu.lengthSurcharges[length] || 0;
        const finishPrice = menu.finishSurcharges[finish] || 0;
        const specialtyPrice = menu.specialtySurcharges[specialty] || 0;
        const designPrice = menu.classicDesignSurcharges[design] || 0;
        const artPrice = artLevel !== 'None' ? (menu.artLevelPrices[artLevel as ArtLevel] || 0) : 0;
        const blingPrice = menu.blingDensityPrices[bling] || 0;
        const foreignPrice = menu.modifierSurcharges[foreignWork] || 0;

        const total = basePrice + lengthPrice + finishPrice + specialtyPrice + designPrice + artPrice + blingPrice + foreignPrice;
        setPrice(total.toFixed(2));
    }, [serviceType, length, finish, specialty, design, artLevel, bling, foreignWork, menu, initialData]);

    // ... (Handlers stay the same)

    const handleAddProduct = () => {
        if (!newProduct.brand || !newProduct.code) return;
        setProducts([...products, { ...newProduct } as ProductUsed]);
        setNewProduct({ brand: '', code: '', name: '', category: 'Color' });
    };

    const handleRemoveProduct = (index: number) => {
        setProducts(products.filter((_, i) => i !== index));
    };

    const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files);
            setPhotos([...photos, ...newFiles]);

            // Create previews
            const newPreviews = newFiles.map(file => URL.createObjectURL(file));
            setPhotoPreviews([...photoPreviews, ...newPreviews]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user.id || !clientId) return;
        setSubmitting(true);

        try {
            // 1. Upload Photos (Only new files)
            const newPhotoUrls: string[] = [];
            for (const file of photos) {
                const storageRef = ref(storage, `users/${user.id}/clients/${clientId}/${Date.now()}_${file.name}`);
                await uploadBytes(storageRef, file);
                const url = getDownloadURL(storageRef);
                newPhotoUrls.push(await url);
            }

            // Combine with existing photos if editing
            const finalPhotoUrls = initialData ? [...(initialData.photos?.after || []), ...newPhotoUrls] : newPhotoUrls;

            // 2. Create/Update Service Record
            const recordData = {
                clientId,
                userId: user.id,
                date: initialData ? initialData.date : Timestamp.now(), // Keep original date if editing
                serviceType,
                shape,
                length,
                productsUsed: products,
                addons: [
                    finish !== 'Glossy' ? finish : null,
                    specialty !== 'None' ? specialty : null,
                    design !== 'None' ? design : null,
                    artLevel !== 'None' ? artLevel : null,
                    bling !== 'None' ? `Bling: ${bling}` : null,
                    foreignWork !== 'None' ? foreignWork : null
                ].filter(Boolean) as string[],
                price: parseFloat(price) || 0,
                tip: parseFloat(tip) || 0,
                photos: {
                    after: finalPhotoUrls
                },
                techNotes: notes,
                updatedAt: Timestamp.now()
            };

            if (serviceId) {
                // Update existing
                const { doc, updateDoc } = await import('firebase/firestore');
                await updateDoc(doc(db, 'service_records', serviceId), recordData);
            } else {
                // Create new
                await addDoc(collection(db, 'service_records'), {
                    ...recordData,
                    createdAt: Timestamp.now()
                });
            }

            if (onSuccess) onSuccess();
            onClose();

            // Reset Form if creating new (not strictly necessary as component unmounts, but good practice)
            if (!serviceId) {
                setServiceType('Gel Manicure' as SystemType);
                // ... reset others
            }

        } catch (error) {
            console.error("Error logging service:", error);
            alert("Failed to save service record.");
        } finally {
            setSubmitting(false);
        }
    };

    // Close on Escape
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-2xl w-full max-w-2xl flex flex-col shadow-2xl max-h-[90vh] relative overflow-hidden"
                onClick={e => e.stopPropagation()}
            >
                {/* Fixed Header */}
                <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-white z-10">
                    <h2 className="text-2xl font-bold text-charcoal">{serviceId ? 'Edit Visit' : 'Log New Visit'}</h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>

                {/* Scrollable Content */}
                <div className="overflow-y-auto p-6 space-y-6">
                    {/* Service Details */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Service</label>
                            <select
                                value={serviceType}
                                onChange={(e) => setServiceType(e.target.value as SystemType)}
                                className="w-full p-3 rounded-xl border border-gray-200 bg-gray-50 font-medium"
                            >
                                <option>Gel Manicure</option>
                                <option>Acrylic</option>
                                <option>Gel-X</option>
                                <option>Hard Gel</option>
                                <option>Structure Gel</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Shape</label>
                            <select
                                value={shape}
                                onChange={(e) => setShape(e.target.value)}
                                className="w-full p-3 rounded-xl border border-gray-200 bg-gray-50 font-medium"
                            >
                                <option>Square</option>
                                <option>Coffin</option>
                                <option>Almond</option>
                                <option>Stiletto</option>
                                <option>Oval</option>
                                <option>Squoval</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Length</label>
                            <select
                                value={length}
                                onChange={(e) => setLength(e.target.value as NailLength)}
                                className="w-full p-3 rounded-xl border border-gray-200 bg-gray-50 font-medium"
                            >
                                <option>Short</option>
                                <option>Medium</option>
                                <option>Long</option>
                                <option>XL</option>
                                <option>XXL</option>
                            </select>
                        </div>
                    </div>

                    {/* Add-ons (Desking Tool) */}
                    <div className="bg-pink-50 p-4 rounded-xl border border-pink-100">
                        <h3 className="text-sm font-bold text-pink-600 mb-3 flex items-center">
                            <Calculator size={16} className="mr-2" />
                            Smart Pricing Add-ons
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1">Finish</label>
                                <select value={finish} onChange={e => setFinish(e.target.value as FinishType)} className="w-full p-2 rounded-lg border border-gray-200 text-sm">
                                    <option>Glossy</option>
                                    <option>Matte</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1">Specialty</label>
                                <select value={specialty} onChange={e => setSpecialty(e.target.value as SpecialtyEffect)} className="w-full p-2 rounded-lg border border-gray-200 text-sm">
                                    <option>None</option>
                                    <option>Chrome</option>
                                    <option>Holo</option>
                                    <option>Cat Eye</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1">Design</label>
                                <select value={design} onChange={e => setDesign(e.target.value as ClassicDesign)} className="w-full p-2 rounded-lg border border-gray-200 text-sm">
                                    <option>None</option>
                                    <option>French Tip</option>
                                    <option>Ombre</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1">Art Level</label>
                                <select value={artLevel} onChange={e => setArtLevel(e.target.value as ArtLevel | 'None')} className="w-full p-2 rounded-lg border border-gray-200 text-sm">
                                    <option>None</option>
                                    <option>Level 1</option>
                                    <option>Level 2</option>
                                    <option>Level 3</option>
                                    <option>Level 4</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1">Bling</label>
                                <select value={bling} onChange={e => setBling(e.target.value as BlingDensity)} className="w-full p-2 rounded-lg border border-gray-200 text-sm">
                                    <option>None</option>
                                    <option>Minimal</option>
                                    <option>Moderate</option>
                                    <option>Heavy</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1">Foreign Work</label>
                                <select value={foreignWork} onChange={e => setForeignWork(e.target.value as ForeignWork)} className="w-full p-2 rounded-lg border border-gray-200 text-sm">
                                    <option>None</option>
                                    <option>Foreign Fill</option>
                                    <option>Foreign Removal</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Products Used (The "RO") */}
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                        <h3 className="text-sm font-bold text-gray-700 mb-3">Products Used (The &quot;Recipe&quot;)</h3>

                        {/* List */}
                        <div className="space-y-2 mb-3">
                            {products.map((prod, idx) => (
                                <div key={idx} className="flex items-center justify-between bg-white p-2 rounded-lg border border-gray-200 text-sm">
                                    <span className="font-bold text-gray-600 w-16">{prod.category}</span>
                                    <span className="font-medium text-charcoal flex-1 mx-2">{prod.brand} {prod.code}</span>
                                    <span className="text-gray-400 text-xs mr-2">{prod.name}</span>
                                    <button type="button" onClick={() => handleRemoveProduct(idx)} className="text-red-400 hover:text-red-600">
                                        <X size={16} />
                                    </button>
                                </div>
                            ))}
                            {products.length === 0 && <p className="text-xs text-gray-400 italic text-center py-2">No products logged yet.</p>}
                        </div>

                        {/* Add New */}
                        <div className="flex gap-2 items-end">
                            <div className="w-24">
                                <input
                                    placeholder="Brand"
                                    className="w-full p-2 rounded-lg border border-gray-200 text-sm"
                                    value={newProduct.brand}
                                    onChange={e => setNewProduct({ ...newProduct, brand: e.target.value })}
                                />
                            </div>
                            <div className="w-20">
                                <input
                                    placeholder="Code"
                                    className="w-full p-2 rounded-lg border border-gray-200 text-sm"
                                    value={newProduct.code}
                                    onChange={e => setNewProduct({ ...newProduct, code: e.target.value })}
                                />
                            </div>
                            <div className="flex-1">
                                <input
                                    placeholder="Name (Optional)"
                                    className="w-full p-2 rounded-lg border border-gray-200 text-sm"
                                    value={newProduct.name}
                                    onChange={e => setNewProduct({ ...newProduct, name: e.target.value })}
                                />
                            </div>
                            <button
                                type="button"
                                onClick={handleAddProduct}
                                className="bg-charcoal text-white p-2 rounded-lg hover:bg-black transition-colors"
                            >
                                <Plus size={20} />
                            </button>
                        </div>
                    </div>

                    {/* Photos */}
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Result Photos</label>
                        <div className="flex gap-4 overflow-x-auto pb-2">
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center text-gray-400 hover:border-pink-500 hover:text-pink-500 hover:bg-pink-50 transition-all flex-shrink-0"
                            >
                                <Camera size={24} />
                                <span className="text-xs font-bold mt-1">Add Photo</span>
                            </button>
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                multiple
                                accept="image/*"
                                onChange={handlePhotoSelect}
                            />
                            {photoPreviews.map((src, idx) => (
                                <div key={idx} className="relative w-24 h-24 rounded-xl overflow-hidden border border-gray-200 flex-shrink-0 group">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={src} alt="Preview" className="w-full h-full object-cover" />
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setPhotos(photos.filter((_, i) => i !== idx));
                                            setPhotoPreviews(photoPreviews.filter((_, i) => i !== idx));
                                        }}
                                        className="absolute top-1 right-1 bg-black/50 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <X size={12} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Financials & Notes */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Total Price</label>
                            <div className="relative">
                                <DollarSign size={16} className="absolute left-3 top-3.5 text-gray-400" />
                                <input
                                    type="number"
                                    value={price}
                                    onChange={e => setPrice(e.target.value)}
                                    className="w-full pl-8 pr-4 py-3 rounded-xl border border-gray-200 font-bold text-lg"
                                    placeholder="0.00"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Tip Amount</label>
                            <div className="relative">
                                <DollarSign size={16} className="absolute left-3 top-3.5 text-gray-400" />
                                <input
                                    type="number"
                                    value={tip}
                                    onChange={e => setTip(e.target.value)}
                                    className="w-full pl-8 pr-4 py-3 rounded-xl border border-gray-200 font-bold text-lg text-green-600"
                                    placeholder="0.00"
                                />
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Tech Notes</label>
                        <textarea
                            value={notes}
                            onChange={e => setNotes(e.target.value)}
                            className="w-full p-3 rounded-xl border border-gray-200 text-sm h-24"
                            placeholder="Any issues? Client mood? Special requests?"
                        />
                    </div>

                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={submitting}
                            className="w-full bg-pink-500 text-white py-4 rounded-xl font-bold hover:bg-pink-600 transition-colors flex items-center justify-center disabled:opacity-70 shadow-lg shadow-pink-200"
                        >
                            {submitting ? <Loader2 className="animate-spin mr-2" /> : 'Save Service Record'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

import { useState } from 'react';
import { useServiceStore } from '../store/useServiceStore';
import { Trash2, RotateCcw, DollarSign, Clock, Tag } from 'lucide-react';
import type { BaseService, AddOn, ServiceCategory } from '../types/serviceSchema';

export default function ServiceMenu() {
    const { menu, updateService, addService, deleteService, updateAddOn, addAddOn, deleteAddOn, updateLengthUpcharge, resetMenu } = useServiceStore();
    const [activeTab, setActiveTab] = useState<'services' | 'addons' | 'upcharges'>('services');

    // Temporary state for new items
    const [newService, setNewService] = useState<Partial<BaseService>>({
        name: '', basePrice: 0, durationMinutes: 60, category: 'Extension', tier: 'Full Set'
    });
    const [newAddOn, setNewAddOn] = useState<Partial<AddOn>>({
        name: '', price: 0, durationMinutes: 15, keywords: []
    });

    const handleAddService = () => {
        if (newService.name) {
            const serviceToAdd = {
                ...newService,
                id: `s_${Date.now()}`
            } as BaseService;
            addService(serviceToAdd);
            setNewService({ name: '', basePrice: 0, durationMinutes: 60, category: 'Extension', tier: 'Full Set' });
        }
    };

    const handleAddAddOn = () => {
        if (newAddOn.name) {
            const addOnToAdd = {
                ...newAddOn,
                id: `a_${Date.now()}`
            } as AddOn;
            addAddOn(addOnToAdd);
            setNewAddOn({ name: '', price: 0, durationMinutes: 15, keywords: [] });
        }
    };

    return (
        <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-charcoal font-display">Service Menu</h1>
                    <p className="text-gray-600">Customize your services and prices for accurate AI quotes.</p>
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
            <div className="flex space-x-1 bg-gray-100 p-1 rounded-xl w-fit">
                {(['services', 'addons', 'upcharges'] as const).map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-6 py-2 rounded-lg text-sm font-bold capitalize transition-all ${activeTab === tab ? 'bg-white text-charcoal shadow-sm' : 'text-gray-500 hover:text-charcoal'}`}
                    >
                        {tab === 'addons' ? 'Add-Ons' : tab}
                    </button>
                ))}
            </div>

            {/* Content */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                {activeTab === 'services' && (
                    <div className="p-6 space-y-6">
                        <div className="grid grid-cols-12 gap-4 text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 px-4">
                            <div className="col-span-4">Service Name</div>
                            <div className="col-span-2">Category</div>
                            <div className="col-span-2">Price ($)</div>
                            <div className="col-span-2">Time (min)</div>
                            <div className="col-span-2 text-right">Actions</div>
                        </div>

                        {menu.services.map((service) => (
                            <div key={service.id} className="grid grid-cols-12 gap-4 items-center p-4 bg-gray-50 rounded-xl hover:bg-pink-50/30 transition-colors group">
                                <div className="col-span-4">
                                    <input
                                        type="text"
                                        value={service.name}
                                        onChange={(e) => updateService(service.id, { name: e.target.value })}
                                        className="w-full bg-transparent font-bold text-charcoal focus:outline-none focus:border-b-2 border-pink-500"
                                    />
                                </div>
                                <div className="col-span-2">
                                    <select
                                        value={service.category}
                                        onChange={(e) => updateService(service.id, { category: e.target.value as ServiceCategory })}
                                        className="bg-transparent text-sm text-gray-600 focus:outline-none"
                                    >
                                        <option value="Extension">Extension</option>
                                        <option value="Manicure">Manicure</option>
                                        <option value="Pedicure">Pedicure</option>
                                    </select>
                                </div>
                                <div className="col-span-2 relative">
                                    <DollarSign size={14} className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="number"
                                        value={service.basePrice}
                                        onChange={(e) => updateService(service.id, { basePrice: Number(e.target.value) })}
                                        className="w-full pl-5 bg-transparent text-charcoal focus:outline-none"
                                    />
                                </div>
                                <div className="col-span-2 relative">
                                    <Clock size={14} className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="number"
                                        value={service.durationMinutes}
                                        onChange={(e) => updateService(service.id, { durationMinutes: Number(e.target.value) })}
                                        className="w-full pl-5 bg-transparent text-charcoal focus:outline-none"
                                    />
                                </div>
                                <div className="col-span-2 text-right">
                                    <button
                                        onClick={() => deleteService(service.id)}
                                        className="text-gray-400 hover:text-red-500 p-2 rounded-full hover:bg-red-50 transition-colors"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        ))}

                        {/* Add New Service */}
                        <div className="border-t border-gray-100 pt-6 mt-6">
                            <h3 className="font-bold text-charcoal mb-4">Add New Service</h3>
                            <div className="grid grid-cols-12 gap-4 items-center p-4 border-2 border-dashed border-gray-200 rounded-xl">
                                <div className="col-span-4">
                                    <input
                                        placeholder="Service Name"
                                        value={newService.name}
                                        onChange={(e) => setNewService({ ...newService, name: e.target.value })}
                                        className="w-full bg-transparent focus:outline-none"
                                    />
                                </div>
                                <div className="col-span-2">
                                    <select
                                        value={newService.category}
                                        onChange={(e) => setNewService({ ...newService, category: e.target.value as ServiceCategory })}
                                        className="w-full bg-transparent text-sm text-gray-600 focus:outline-none"
                                    >
                                        <option value="Extension">Extension</option>
                                        <option value="Manicure">Manicure</option>
                                        <option value="Pedicure">Pedicure</option>
                                    </select>
                                </div>
                                <div className="col-span-2">
                                    <input
                                        type="number"
                                        placeholder="Price"
                                        value={newService.basePrice || ''}
                                        onChange={(e) => setNewService({ ...newService, basePrice: Number(e.target.value) })}
                                        className="w-full bg-transparent focus:outline-none"
                                    />
                                </div>
                                <div className="col-span-2">
                                    <input
                                        type="number"
                                        placeholder="Min"
                                        value={newService.durationMinutes || ''}
                                        onChange={(e) => setNewService({ ...newService, durationMinutes: Number(e.target.value) })}
                                        className="w-full bg-transparent focus:outline-none"
                                    />
                                </div>
                                <div className="col-span-2 text-right">
                                    <button
                                        onClick={handleAddService}
                                        disabled={!newService.name}
                                        className="bg-charcoal text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-black disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Add
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'addons' && (
                    <div className="p-6 space-y-6">
                        <div className="grid grid-cols-12 gap-4 text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 px-4">
                            <div className="col-span-4">Add-On Name</div>
                            <div className="col-span-4">Keywords (for AI)</div>
                            <div className="col-span-2">Price ($)</div>
                            <div className="col-span-2 text-right">Actions</div>
                        </div>

                        {menu.addOns.map((addon) => (
                            <div key={addon.id} className="grid grid-cols-12 gap-4 items-center p-4 bg-gray-50 rounded-xl hover:bg-pink-50/30 transition-colors">
                                <div className="col-span-4">
                                    <input
                                        type="text"
                                        value={addon.name}
                                        onChange={(e) => updateAddOn(addon.id, { name: e.target.value })}
                                        className="w-full bg-transparent font-bold text-charcoal focus:outline-none focus:border-b-2 border-pink-500"
                                    />
                                </div>
                                <div className="col-span-4">
                                    <input
                                        type="text"
                                        value={addon.keywords.join(', ')}
                                        onChange={(e) => updateAddOn(addon.id, { keywords: e.target.value.split(',').map(k => k.trim()) })}
                                        className="w-full bg-transparent text-sm text-gray-500 focus:outline-none focus:border-b border-gray-300"
                                        placeholder="comma, separated, tags"
                                    />
                                </div>
                                <div className="col-span-2 relative">
                                    <DollarSign size={14} className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="number"
                                        value={addon.price}
                                        onChange={(e) => updateAddOn(addon.id, { price: Number(e.target.value) })}
                                        className="w-full pl-5 bg-transparent text-charcoal focus:outline-none"
                                    />
                                </div>
                                <div className="col-span-2 text-right">
                                    <button
                                        onClick={() => deleteAddOn(addon.id)}
                                        className="text-gray-400 hover:text-red-500 p-2 rounded-full hover:bg-red-50 transition-colors"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        ))}

                        {/* Add New Add-On */}
                        <div className="border-t border-gray-100 pt-6 mt-6">
                            <h3 className="font-bold text-charcoal mb-4">Add New Add-On</h3>
                            <div className="grid grid-cols-12 gap-4 items-center p-4 border-2 border-dashed border-gray-200 rounded-xl">
                                <div className="col-span-4">
                                    <input
                                        placeholder="Add-On Name"
                                        value={newAddOn.name}
                                        onChange={(e) => setNewAddOn({ ...newAddOn, name: e.target.value })}
                                        className="w-full bg-transparent focus:outline-none"
                                    />
                                </div>
                                <div className="col-span-4">
                                    <input
                                        placeholder="Keywords (comma separated)"
                                        value={newAddOn.keywords?.join(', ')}
                                        onChange={(e) => setNewAddOn({ ...newAddOn, keywords: e.target.value.split(',').map(k => k.trim()) })}
                                        className="w-full bg-transparent text-sm focus:outline-none"
                                    />
                                </div>
                                <div className="col-span-2">
                                    <input
                                        type="number"
                                        placeholder="Price"
                                        value={newAddOn.price || ''}
                                        onChange={(e) => setNewAddOn({ ...newAddOn, price: Number(e.target.value) })}
                                        className="w-full bg-transparent focus:outline-none"
                                    />
                                </div>
                                <div className="col-span-2 text-right">
                                    <button
                                        onClick={handleAddAddOn}
                                        disabled={!newAddOn.name}
                                        className="bg-charcoal text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-black disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Add
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'upcharges' && (
                    <div className="p-6 space-y-8">
                        {/* Length Upcharges */}
                        <div>
                            <h3 className="font-bold text-charcoal mb-4 flex items-center">
                                <Tag size={18} className="mr-2 text-pink-500" />
                                Length Upcharges
                            </h3>
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                                {menu.lengthUpcharges.map((length) => (
                                    <div key={length.length} className="bg-gray-50 p-4 rounded-xl text-center">
                                        <div className="text-sm font-bold text-gray-500 mb-2">{length.length}</div>
                                        <div className="relative inline-block w-20">
                                            <DollarSign size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
                                            <input
                                                type="number"
                                                value={length.price}
                                                onChange={(e) => updateLengthUpcharge(length.length, Number(e.target.value))}
                                                className="w-full pl-6 py-1 bg-white rounded-lg border border-gray-200 text-center font-bold text-charcoal focus:outline-none focus:border-pink-500"
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

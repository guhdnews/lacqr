import { useState } from 'react';
import { Plus, Save, Trash2 } from 'lucide-react';

export default function PriceList() {
    const [services, _setServices] = useState([
        { id: 1, name: 'Gel-X Full Set', price: 65 },
        { id: 2, name: 'Acrylic Full Set', price: 55 },
        { id: 3, name: 'Structured Gel Manicure', price: 45 },
    ]);

    const [addOns, _setAddOns] = useState([
        { id: 1, name: 'French Tip', price: 15 },
        { id: 2, name: 'Chrome Powder', price: 15 },
        { id: 3, name: 'Nail Art (Level 1)', price: 5 },
        { id: 4, name: 'Nail Art (Level 2)', price: 15 },
        { id: 5, name: 'Nail Art (Level 3)', price: 30 },
        { id: 6, name: '3D Charm', price: 5 },
    ]);

    return (
        <div className="max-w-3xl mx-auto space-y-8">
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight font-serif">Price List</h2>
                    <p className="text-gray-500 mt-2">Configure your base prices for the AI to use.</p>
                </div>
                <button className="bg-charcoal text-white px-6 py-3 rounded-xl font-bold hover:bg-black transition-all shadow-lg flex items-center space-x-2">
                    <Save size={18} />
                    <span>Save Changes</span>
                </button>
            </div>

            {/* Base Services */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                <h3 className="font-bold text-lg mb-6">Base Services</h3>
                <div className="space-y-4">
                    {services.map((service) => (
                        <div key={service.id} className="flex items-center space-x-4 group">
                            <input
                                type="text"
                                value={service.name}
                                className="flex-1 border-b border-gray-200 py-2 focus:outline-none focus:border-pink-500 font-medium transition-colors bg-transparent"
                            />
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                                <input
                                    type="number"
                                    value={service.price}
                                    className="w-24 bg-gray-50 rounded-lg py-2 pl-6 pr-3 font-medium text-right focus:outline-none focus:ring-2 focus:ring-pink-500/20"
                                />
                            </div>
                            <button className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">
                                <Trash2 size={18} />
                            </button>
                        </div>
                    ))}
                    <button className="flex items-center text-pink-600 font-medium text-sm hover:text-pink-700 mt-4">
                        <Plus size={16} className="mr-1" /> Add Service
                    </button>
                </div>
            </div>

            {/* Add-ons */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                <h3 className="font-bold text-lg mb-6">Add-ons & Art</h3>
                <div className="space-y-4">
                    {addOns.map((addon) => (
                        <div key={addon.id} className="flex items-center space-x-4 group">
                            <input
                                type="text"
                                value={addon.name}
                                className="flex-1 border-b border-gray-200 py-2 focus:outline-none focus:border-pink-500 font-medium transition-colors bg-transparent"
                            />
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                                <input
                                    type="number"
                                    value={addon.price}
                                    className="w-24 bg-gray-50 rounded-lg py-2 pl-6 pr-3 font-medium text-right focus:outline-none focus:ring-2 focus:ring-pink-500/20"
                                />
                            </div>
                            <button className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">
                                <Trash2 size={18} />
                            </button>
                        </div>
                    ))}
                    <button className="flex items-center text-pink-600 font-medium text-sm hover:text-pink-700 mt-4">
                        <Plus size={16} className="mr-1" /> Add Item
                    </button>
                </div>
            </div>
        </div>
    );
}

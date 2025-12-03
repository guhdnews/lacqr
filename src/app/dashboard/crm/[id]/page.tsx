'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAppStore } from '@/store/useAppStore';
import { doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { ArrowLeft, Phone, Mail, Calendar, Clock, Edit, Trash2, MessageSquare, TrendingUp, AlertTriangle, Star, Droplet, Ruler, Save, X } from 'lucide-react';
import { useClientProfile } from '@/hooks/useClientProfile';
import ServiceLogModal from '@/components/ServiceLogModal';

export default function ClientDetailPage() {
    const handleDeleteService = async (serviceId: string) => {
        if (!confirm("Are you sure you want to delete this service record?")) return;
        try {
            await deleteDoc(doc(db, 'service_records', serviceId));
            refresh();
        } catch (err) {
            console.error("Error deleting service:", err);
            alert("Failed to delete service record.");
        }
    };

    if (loading) {
        return <div className="p-8 text-center text-gray-500">Loading client profile...</div>;
    }

    if (error || !client) {
        return (
            <div className="p-8 text-center">
                <h2 className="text-xl font-bold text-gray-800">Client not found</h2>
                <p className="text-red-500">{error}</p>
                <button onClick={() => router.back()} className="text-pink-500 hover:underline mt-4">
                    Go Back
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto p-4 space-y-8 pb-20">
            {/* Header with Smart Stats */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center space-x-4">
                    <button
                        onClick={() => router.back()}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <ArrowLeft size={20} className="text-gray-600" />
                    </button>
                    <div>
                        <div className="flex items-center gap-3">
                            {isEditingProfile ? (
                                <input
                                    value={profileForm.name || ''}
                                    onChange={e => setProfileForm({ ...profileForm, name: e.target.value })}
                                    className="text-3xl font-bold font-serif text-charcoal border-b border-gray-300 focus:border-pink-500 outline-none bg-transparent"
                                />
                            ) : (
                                <h1 className="text-3xl font-bold font-serif text-charcoal">{client.name}</h1>
                            )}

                            {client.stats?.clientGrade && (
                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${client.stats.clientGrade.startsWith('A') ? 'bg-green-100 text-green-700' :
                                    client.stats.clientGrade === 'B' ? 'bg-blue-100 text-blue-700' :
                                        'bg-gray-100 text-gray-700'
                                    }`}>
                                    Grade: {client.stats.clientGrade}
                                </span>
                            )}
                        </div>
                        <p className="text-gray-500 text-sm flex items-center gap-2">
                            Client since {client.createdAt ? new Date(client.createdAt.seconds * 1000).toLocaleDateString() : 'Unknown'}
                            {client.lifecycle?.churnRisk && (
                                <span className="flex items-center text-red-500 font-bold text-xs">
                                    <AlertTriangle size={12} className="mr-1" /> At Risk
                                </span>
                            )}
                        </p>
                    </div>
                </div>

                {/* Revenue Intelligence Cards */}
                <div className="flex gap-4">
                    <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm text-center min-w-[100px]">
                        <p className="text-xs text-gray-400 uppercase font-bold">LTV</p>
                        <p className="font-bold text-lg text-green-600">${client.stats?.totalSpend.toFixed(0) || 0}</p>
                    </div>
                    <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm text-center min-w-[100px]">
                        <p className="text-xs text-gray-400 uppercase font-bold">Avg Ticket</p>
                        <p className="font-bold text-lg text-charcoal">${client.stats?.averageTicket.toFixed(0) || 0}</p>
                    </div>
                    <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm text-center min-w-[100px]">
                        <p className="text-xs text-gray-400 uppercase font-bold">Next Due</p>
                        <p className="font-bold text-lg text-blue-600">
                            {client.lifecycle?.predictedNextVisit
                                ? new Date(client.lifecycle.predictedNextVisit.seconds * 1000).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
                                : 'TBD'}
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
                {/* Left Column: Contact & Nail Profile */}
                <div className="space-y-6">
                    {/* Contact Info */}
                    {/* Contact Info */}
                    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4 relative">
                        {/* Edit/Delete Controls */}
                        <div className="absolute top-4 right-4 flex space-x-2">
                            {isEditingProfile ? (
                                <>
                                    <button onClick={() => handleDeleteClient()} className="p-1 hover:bg-red-100 rounded text-red-500" title="Delete Client"><Trash2 size={16} /></button>
                                    <button onClick={() => setIsEditingProfile(false)} className="p-1 hover:bg-gray-100 rounded text-gray-500"><X size={16} /></button>
                                    <button onClick={handleSaveProfile} className="p-1 hover:bg-green-100 rounded text-green-600"><Save size={16} /></button>
                                </>
                            ) : (
                                <button onClick={() => setIsEditingProfile(true)} className="text-xs text-pink-500 font-bold hover:underline">Edit Profile</button>
                            )}
                        </div>

                        <h3 className="font-bold text-gray-800 mb-2">Contact Details</h3>
                        <div className="flex items-center space-x-3 text-gray-600">
                            <Phone size={18} className="text-pink-500" />
                            {isEditingProfile ? (
                                <input
                                    value={profileForm.phone || ''}
                                    onChange={e => setProfileForm({ ...profileForm, phone: e.target.value })}
                                    className="font-medium border-b border-gray-300 focus:border-pink-500 outline-none bg-transparent w-full"
                                    placeholder="Phone"
                                />
                            ) : (
                                <p className="font-medium">{client.phone || 'N/A'}</p>
                            )}
                        </div>
                        <div className="flex items-center space-x-3 text-gray-600">
                            <Mail size={18} className="text-purple-500" />
                            {isEditingProfile ? (
                                <input
                                    value={profileForm.email || ''}
                                    onChange={e => setProfileForm({ ...profileForm, email: e.target.value })}
                                    className="font-medium border-b border-gray-300 focus:border-pink-500 outline-none bg-transparent w-full"
                                    placeholder="Email"
                                />
                            ) : (
                                <p className="font-medium">{client.email || 'N/A'}</p>
                            )}
                        </div>
                        <div className="flex items-center space-x-3 text-gray-600">
                            <MessageSquare size={18} className="text-blue-500" />
                            {isEditingProfile ? (
                                <input
                                    value={profileForm.instagram || ''}
                                    onChange={e => setProfileForm({ ...profileForm, instagram: e.target.value })}
                                    className="font-medium border-b border-gray-300 focus:border-pink-500 outline-none bg-transparent w-full"
                                    placeholder="Instagram"
                                />
                            ) : (
                                <p className="font-medium">{client.instagram || 'N/A'}</p>
                            )}
                        </div>
                    </div>

                    {/* Nail Profile (The "VIN" Spec) */}
                    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-gray-800">Nail Profile</h3>
                        </div>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-500 flex items-center"><Ruler size={14} className="mr-2" /> Bed Size</span>
                                {isEditingProfile ? (
                                    <select
                                        value={profileForm.bedSize || 'Unknown'}
                                        onChange={e => setProfileForm({ ...profileForm, bedSize: e.target.value })}
                                        className="text-right border-b border-gray-300 focus:border-pink-500 outline-none bg-transparent"
                                    >
                                        <option>Small</option><option>Medium</option><option>Large</option><option>Unknown</option>
                                    </select>
                                ) : (
                                    <span className="font-medium">{client.nailProfile?.bedSize || 'Unknown'}</span>
                                )}
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-500 flex items-center"><Droplet size={14} className="mr-2" /> Cuticle</span>
                                {isEditingProfile ? (
                                    <select
                                        value={profileForm.cuticleType || 'Unknown'}
                                        onChange={e => setProfileForm({ ...profileForm, cuticleType: e.target.value })}
                                        className="text-right border-b border-gray-300 focus:border-pink-500 outline-none bg-transparent"
                                    >
                                        <option>Dry</option><option>Oily</option><option>Normal</option><option>Unknown</option>
                                    </select>
                                ) : (
                                    <span className="font-medium">{client.nailProfile?.cuticleType || 'Unknown'}</span>
                                )}
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-500 flex items-center"><TrendingUp size={14} className="mr-2" /> Health</span>
                                {isEditingProfile ? (
                                    <select
                                        value={profileForm.naturalNailHealth || 'Unknown'}
                                        onChange={e => setProfileForm({ ...profileForm, naturalNailHealth: e.target.value })}
                                        className="text-right border-b border-gray-300 focus:border-pink-500 outline-none bg-transparent"
                                    >
                                        <option>Strong</option><option>Brittle</option><option>Peeling</option><option>Bitten</option><option>Unknown</option>
                                    </select>
                                ) : (
                                    <span className={`font-medium ${client.nailProfile?.naturalNailHealth === 'Strong' ? 'text-green-600' :
                                        client.nailProfile?.naturalNailHealth === 'Brittle' ? 'text-amber-600' : 'text-gray-800'
                                        }`}>
                                        {client.nailProfile?.naturalNailHealth || 'Unknown'}
                                    </span>
                                )}
                            </div>
                        </div>
                        {(isEditingProfile || client.nailProfile?.notes) && (
                            <div className="mt-4 pt-4 border-t border-gray-50 text-sm text-gray-600 italic">
                                {isEditingProfile ? (
                                    <textarea
                                        value={profileForm.notes || ''}
                                        onChange={e => setProfileForm({ ...profileForm, notes: e.target.value })}
                                        className="w-full p-2 border rounded-lg text-sm"
                                        placeholder="Notes..."
                                    />
                                ) : (
                                    <>&quot;{client.nailProfile?.notes}&quot;</>
                                )}
                            </div>
                        )}
                    </div>
                    onClick={() => {
                        setSelectedService(null);
                        setIsLogModalOpen(true);
                    }}
                    className="text-sm text-pink-500 font-bold hover:underline"
                            >
                    Log New Visit
                </button>
            </div>

            {history.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                    <p className="text-gray-500">No history found. Log their first visit!</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {history.map((item) => (
                        <div key={item.id} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start">
                                <div className="flex items-start space-x-4">
                                    <div className="w-12 h-12 bg-pink-50 rounded-xl flex items-center justify-center text-pink-500 font-bold text-lg">
                                        {item.date ? new Date(item.date.seconds * 1000).getDate() : '?'}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-charcoal">{item.serviceType}</h4>
                                        <p className="text-sm text-gray-500">
                                            {item.date ? new Date(item.date.seconds * 1000).toLocaleDateString(undefined, { month: 'long', year: 'numeric' }) : 'Unknown'}
                                        </p>
                                        {item.addons && item.addons.length > 0 && (
                                            <p className="text-xs text-gray-400 mt-1">+ {item.addons.join(', ')}</p>
                                        )}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-lg">${item.price}</p>
                                    {item.tip > 0 && (
                                        <p className="text-xs text-green-600 font-medium">+${item.tip} tip</p>
                                    )}
                                    <div className="flex space-x-2 justify-end mt-2">
                                        <button
                                            onClick={() => {
                                                setSelectedService(item);
                                                setIsLogModalOpen(true);
                                            }}
                                            className="text-gray-300 hover:text-blue-500 transition-colors"
                                            title="Edit Record"
                                        >
                                            <Edit size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteService(item.id)}
                                            className="text-gray-300 hover:text-red-500 transition-colors"
                                            title="Delete Record"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
                </div >
            </div >

        <ServiceLogModal
            isOpen={isLogModalOpen}
            onClose={() => setIsLogModalOpen(false)}
            clientId={clientId}
            onSuccess={refresh}
            initialData={selectedService}
            serviceId={selectedService?.id}
        />
        </div >
    );
}

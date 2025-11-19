import { Search, MoreHorizontal, UserPlus } from 'lucide-react';

export default function Clients() {
    const clients = [
        { id: 1, name: 'Sarah Johnson', lastVisit: '2 days ago', totalSpent: 450, status: 'Regular' },
        { id: 2, name: 'Emily Davis', lastVisit: '1 week ago', totalSpent: 120, status: 'New' },
        { id: 3, name: 'Jessica Wilson', lastVisit: '3 weeks ago', totalSpent: 890, status: 'VIP' },
        { id: 4, name: 'Ashley Brown', lastVisit: '1 month ago', totalSpent: 65, status: 'Returning' },
    ];

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight font-serif">Clients</h2>
                    <p className="text-gray-500 mt-2">Manage your client database and history.</p>
                </div>
                <button className="bg-charcoal text-white px-6 py-3 rounded-xl font-bold hover:bg-black transition-all shadow-lg flex items-center space-x-2">
                    <UserPlus size={18} />
                    <span>Add Client</span>
                </button>
            </div>

            {/* Search Bar */}
            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                    type="text"
                    placeholder="Search clients by name or phone..."
                    className="w-full bg-white border-none rounded-2xl py-4 pl-12 pr-4 shadow-sm focus:ring-2 focus:ring-pink-500/20 outline-none"
                />
            </div>

            {/* Client List */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider font-bold">
                        <tr>
                            <th className="px-6 py-4">Client Name</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Last Visit</th>
                            <th className="px-6 py-4">Total Spent</th>
                            <th className="px-6 py-4"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {clients.map((client) => (
                            <tr key={client.id} className="hover:bg-gray-50/50 transition-colors group cursor-pointer">
                                <td className="px-6 py-4 font-medium text-charcoal">{client.name}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${client.status === 'VIP' ? 'bg-purple-100 text-purple-600' :
                                        client.status === 'New' ? 'bg-green-100 text-green-600' :
                                            'bg-gray-100 text-gray-600'
                                        }`}>
                                        {client.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-gray-500 text-sm">{client.lastVisit}</td>
                                <td className="px-6 py-4 font-medium text-gray-900">${client.totalSpent}</td>
                                <td className="px-6 py-4 text-right">
                                    <button className="text-gray-300 hover:text-charcoal transition-colors">
                                        <MoreHorizontal size={20} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

import { useState, useEffect } from 'react';
import { BarChart3, Database, AlertTriangle, RefreshCw, Shield } from 'lucide-react';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../lib/firebase';

export default function AdminDashboard() {
    const [activeTab, setActiveTab] = useState<'overview' | 'training' | 'logs'>('overview');
    const [stats, setStats] = useState({
        totalClients: 0,
        totalLogs: 0,
        trainingSamples: 0
    });
    const [logs, setLogs] = useState<any[]>([]);
    const [trainingData, setTrainingData] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchStats();
    }, []);

    useEffect(() => {
        if (activeTab === 'logs') fetchLogs();
        if (activeTab === 'training') fetchTrainingData();
    }, [activeTab]);

    const fetchStats = async () => {
        try {
            const clientsSnap = await getDocs(collection(db, 'clients'));
            const logsSnap = await getDocs(collection(db, 'system_logs'));
            // const trainingSnap = await getDocs(collection(db, 'lacqr_training_dataset')); // Collection might not exist yet

            setStats({
                totalClients: clientsSnap.size,
                totalLogs: logsSnap.size,
                trainingSamples: 0 // trainingSnap.size
            });
        } catch (error) {
            console.error("Error fetching stats:", error);
        }
    };

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const q = query(collection(db, 'system_logs'), orderBy('timestamp', 'desc'), limit(50));
            const snapshot = await getDocs(q);
            setLogs(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        } catch (error) {
            console.error("Error fetching logs:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchTrainingData = async () => {
        setLoading(true);
        try {
            // Check if collection exists by trying to get one doc
            const q = query(collection(db, 'lacqr_training_dataset'), limit(1));
            const snapshot = await getDocs(q);

            if (!snapshot.empty) {
                const fullQ = query(collection(db, 'lacqr_training_dataset'), orderBy('timestamp', 'desc'), limit(50));
                const fullSnapshot = await getDocs(fullQ);
                setTrainingData(fullSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            } else {
                setTrainingData([]);
            }
        } catch (error) {
            console.log("Training data collection might not exist yet or is empty.");
            setTrainingData([]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <div className="flex items-center space-x-3">
                        <div className="bg-charcoal text-white p-3 rounded-xl">
                            <Shield size={24} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-charcoal">Admin Command</h1>
                            <p className="text-gray-500 text-sm">System Overview & Health</p>
                        </div>
                    </div>
                    <button onClick={fetchStats} className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-500">
                        <RefreshCw size={20} />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex space-x-1 bg-white p-1 rounded-xl border border-gray-200 mb-8 w-fit">
                    {[
                        { id: 'overview', label: 'Overview', icon: BarChart3 },
                        { id: 'training', label: 'Training Data', icon: Database },
                        { id: 'logs', label: 'System Logs', icon: AlertTriangle },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === tab.id
                                ? 'bg-charcoal text-white shadow-md'
                                : 'text-gray-500 hover:bg-gray-50'
                                }`}
                        >
                            <tab.icon size={16} />
                            <span>{tab.label}</span>
                        </button>
                    ))}
                </div>

                {/* Content */}
                {activeTab === 'overview' && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                                    <BarChart3 size={24} />
                                </div>
                                <span className="text-xs font-bold text-green-500 bg-green-50 px-2 py-1 rounded-full">+12%</span>
                            </div>
                            <h3 className="text-gray-500 text-sm font-medium">Total Clients</h3>
                            <p className="text-3xl font-bold text-charcoal mt-1">{stats.totalClients}</p>
                        </div>
                        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                                    <Database size={24} />
                                </div>
                            </div>
                            <h3 className="text-gray-500 text-sm font-medium">Training Samples</h3>
                            <p className="text-3xl font-bold text-charcoal mt-1">{stats.trainingSamples}</p>
                        </div>
                        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-2 bg-red-50 text-red-600 rounded-lg">
                                    <AlertTriangle size={24} />
                                </div>
                            </div>
                            <h3 className="text-gray-500 text-sm font-medium">System Logs</h3>
                            <p className="text-3xl font-bold text-charcoal mt-1">{stats.totalLogs}</p>
                        </div>
                    </div>
                )}

                {activeTab === 'logs' && (
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-gray-50">
                            <h3 className="font-bold text-lg">Recent System Logs</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-gray-50 text-gray-500 font-medium">
                                    <tr>
                                        <th className="px-6 py-3">Timestamp</th>
                                        <th className="px-6 py-3">Context</th>
                                        <th className="px-6 py-3">Error</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {logs.map((log) => (
                                        <tr key={log.id} className="hover:bg-gray-50/50">
                                            <td className="px-6 py-4 text-gray-500 font-mono text-xs">
                                                {new Date(log.timestamp).toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4 font-medium text-charcoal">
                                                <span className="bg-gray-100 px-2 py-1 rounded text-xs">{log.context}</span>
                                            </td>
                                            <td className="px-6 py-4 text-red-600 font-mono text-xs truncate max-w-md">
                                                {log.error}
                                            </td>
                                        </tr>
                                    ))}
                                    {logs.length === 0 && (
                                        <tr>
                                            <td colSpan={3} className="px-6 py-8 text-center text-gray-400">
                                                No logs found. System healthy.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'training' && (
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-gray-50">
                            <h3 className="font-bold text-lg">Training Data Samples</h3>
                        </div>
                        {loading ? (
                            <div className="p-12 text-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-charcoal mx-auto"></div>
                                <p className="text-gray-500 mt-4">Loading data...</p>
                            </div>
                        ) : trainingData.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-gray-50 text-gray-500 font-medium">
                                        <tr>
                                            <th className="px-6 py-3">Timestamp</th>
                                            <th className="px-6 py-3">Original</th>
                                            <th className="px-6 py-3">Correction</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {trainingData.map((data) => (
                                            <tr key={data.id} className="hover:bg-gray-50/50">
                                                <td className="px-6 py-4 text-gray-500 font-mono text-xs">
                                                    {new Date(data.timestamp).toLocaleString()}
                                                </td>
                                                <td className="px-6 py-4 font-medium text-charcoal truncate max-w-xs">
                                                    {JSON.stringify(data.original)}
                                                </td>
                                                <td className="px-6 py-4 text-green-600 font-mono text-xs truncate max-w-xs">
                                                    {JSON.stringify(data.correction)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="p-12 text-center">
                                <Database size={48} className="mx-auto text-gray-200 mb-4" />
                                <h3 className="text-lg font-bold text-gray-400">No Training Data</h3>
                                <p className="text-gray-400 mt-2">No corrections have been submitted yet.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

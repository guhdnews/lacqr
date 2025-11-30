'use client';

import { useState, useEffect } from 'react';
import { addDoc, collection, getDocs, limit, query } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function DebugTestPage() {
    const [status, setStatus] = useState<string[]>([]);

    const addStatus = (msg: string) => setStatus(prev => [...prev, `${new Date().toISOString().split('T')[1]} - ${msg}`]);

    const runTest = async () => {
        setStatus([]);
        addStatus("Starting Firestore Test...");

        try {
            // 1. Test Write
            addStatus("Attempting to write to 'app_logs'...");
            const docRef = await addDoc(collection(db, 'app_logs'), {
                message: "Debug Test Log",
                timestamp: new Date(),
                level: "info",
                userAgent: navigator.userAgent
            });
            addStatus(`✅ Write Success! Doc ID: ${docRef.id}`);

            // 2. Test Read
            addStatus("Attempting to read from 'app_logs'...");
            const q = query(collection(db, 'app_logs'), limit(5));
            const snapshot = await getDocs(q);
            addStatus(`✅ Read Success! Found ${snapshot.size} docs.`);
            snapshot.forEach(doc => {
                addStatus(`   - ${doc.id}: ${JSON.stringify(doc.data())}`);
            });

        } catch (error: any) {
            addStatus(`❌ ERROR: ${error.message}`);
            addStatus(`   Code: ${error.code}`);
            console.error(error);
        }
    };

    return (
        <div className="p-8 font-mono text-sm">
            <h1 className="text-xl font-bold mb-4">Firestore Diagnostic</h1>
            <button
                onClick={runTest}
                className="bg-blue-600 text-white px-4 py-2 rounded mb-4 hover:bg-blue-700"
            >
                Run Test
            </button>
            <div className="bg-gray-100 p-4 rounded border border-gray-300 min-h-[200px]">
                {status.map((s, i) => <div key={i}>{s}</div>)}
            </div>
        </div>
    );
}

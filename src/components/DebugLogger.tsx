'use client';

import { useState, useEffect } from 'react';
import { X, Trash2, Copy, Bug } from 'lucide-react';

interface LogEntry {
    timestamp: string;
    level: 'info' | 'warn' | 'error';
    message: string;
    stack?: string;
}

export default function DebugLogger() {
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [isVisible, setIsVisible] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);

    useEffect(() => {
        // Check for debug mode flag
        const isDebug = typeof window !== 'undefined' && (
            window.location.search.includes('debug=true') ||
            localStorage.getItem('lacqr_debug') === 'true'
        );
        setIsVisible(isDebug);

        if (!isDebug) return;

        // Override console methods
        const originalLog = console.log;
        const originalWarn = console.warn;
        const originalError = console.error;

        console.log = (...args) => {
            addLog('info', args);
            originalLog.apply(console, args);
        };

        console.warn = (...args) => {
            addLog('warn', args);
            originalWarn.apply(console, args);
        };

        console.error = (...args) => {
            addLog('error', args);
            originalError.apply(console, args);
        };

        // Capture unhandled errors
        const handleError = (event: ErrorEvent) => {
            addLog('error', [event.message, event.error?.stack]);
        };

        const handleRejection = (event: PromiseRejectionEvent) => {
            addLog('error', ['Unhandled Promise Rejection:', event.reason]);
        };

        window.addEventListener('error', handleError);
        window.addEventListener('unhandledrejection', handleRejection);

        return () => {
            console.log = originalLog;
            console.warn = originalWarn;
            console.error = originalError;
            window.removeEventListener('error', handleError);
            window.removeEventListener('unhandledrejection', handleRejection);
        };
    }, []);

    const addLog = (level: LogEntry['level'], args: any[]) => {
        const message = args.map(arg =>
            typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
        ).join(' ');

        setLogs(prev => [{
            timestamp: new Date().toISOString().split('T')[1].slice(0, -1),
            level,
            message,
            stack: args.find(a => a instanceof Error)?.stack
        }, ...prev].slice(0, 50)); // Keep last 50 logs
    };

    const copyLogs = () => {
        const text = logs.map(l => `[${l.timestamp}] [${l.level.toUpperCase()}] ${l.message} ${l.stack || ''}`).join('\n');
        navigator.clipboard.writeText(text);
        alert('Logs copied to clipboard');
    };

    if (!isVisible) return null;

    if (!isExpanded) {
        return (
            <button
                onClick={() => setIsExpanded(true)}
                className="fixed bottom-4 left-4 z-[9999] bg-red-600 text-white p-3 rounded-full shadow-lg hover:bg-red-700 transition-colors"
            >
                <Bug size={24} />
            </button>
        );
    }

    return (
        <div className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
            <div className="bg-gray-900 w-full max-w-2xl h-[80vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-800">
                <div className="flex justify-between items-center p-4 border-b border-gray-800 bg-gray-950">
                    <h3 className="text-white font-mono font-bold flex items-center gap-2">
                        <Bug className="text-red-500" /> Debug Console
                    </h3>
                    <div className="flex gap-2">
                        <button onClick={copyLogs} className="p-2 text-gray-400 hover:text-white bg-gray-800 rounded-lg">
                            <Copy size={16} />
                        </button>
                        <button onClick={() => setLogs([])} className="p-2 text-gray-400 hover:text-red-400 bg-gray-800 rounded-lg">
                            <Trash2 size={16} />
                        </button>
                        <button onClick={() => setIsExpanded(false)} className="p-2 text-gray-400 hover:text-white bg-gray-800 rounded-lg">
                            <X size={16} />
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-auto p-4 space-y-2 font-mono text-xs">
                    {logs.length === 0 && (
                        <div className="text-gray-600 text-center mt-10">No logs captured yet...</div>
                    )}
                    {logs.map((log, i) => (
                        <div key={i} className={`p-2 rounded border-l-2 ${log.level === 'error' ? 'bg-red-900/20 border-red-500 text-red-200' :
                                log.level === 'warn' ? 'bg-yellow-900/20 border-yellow-500 text-yellow-200' :
                                    'bg-gray-800/50 border-blue-500 text-gray-300'
                            }`}>
                            <div className="flex gap-2 opacity-50 mb-1 text-[10px]">
                                <span>{log.timestamp}</span>
                                <span className="uppercase">{log.level}</span>
                            </div>
                            <div className="whitespace-pre-wrap break-words">{log.message}</div>
                            {log.stack && (
                                <div className="mt-2 text-gray-500 whitespace-pre-wrap overflow-x-auto">
                                    {log.stack}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

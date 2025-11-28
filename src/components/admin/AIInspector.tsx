import React, { useState } from 'react';
import { AI_SERVICE } from '../../services/ai';
import { Upload, Loader2, AlertTriangle, CheckCircle, Bug } from 'lucide-react';

export function AIInspector() {
    const [preview, setPreview] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setPreview(URL.createObjectURL(file));
        setResult(null);
        setError(null);
        setLoading(true);

        try {
            const data = await AI_SERVICE.analyzeImage(file);
            setResult(data);
        } catch (err: any) {
            setError(err.message || "Analysis failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left: Input */}
            <div className="space-y-6">
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-pink-500 transition-colors">
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        id="admin-upload"
                    />
                    <label htmlFor="admin-upload" className="cursor-pointer flex flex-col items-center">
                        {preview ? (
                            <img src={preview} alt="Preview" className="max-h-64 rounded-lg shadow-md mb-4" />
                        ) : (
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                <Upload className="w-8 h-8 text-gray-400" />
                            </div>
                        )}
                        <span className="text-lg font-medium text-gray-900">
                            {loading ? "Analyzing..." : "Upload Nail Image"}
                        </span>
                        <span className="text-sm text-gray-500 mt-1">
                            JPG, PNG (Max 10MB)
                        </span>
                    </label>
                </div>

                {loading && (
                    <div className="flex items-center justify-center gap-2 text-pink-600 animate-pulse">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Running Gemini 2.0 Flash & Florence-2...</span>
                    </div>
                )}

                {error && (
                    <div className="bg-red-50 text-red-700 p-4 rounded-lg flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 mt-0.5" />
                        <div>
                            <h3 className="font-bold">Analysis Failed</h3>
                            <p className="text-sm">{error}</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Right: Output */}
            <div className="space-y-6">
                {result ? (
                    <>
                        {/* Final Decision */}
                        <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                            <h3 className="text-lg font-bold text-green-900 flex items-center gap-2 mb-4">
                                <CheckCircle className="w-5 h-5" />
                                Final Decision
                            </h3>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="block text-green-700 font-medium">Shape</span>
                                    <span className="text-green-900 text-lg">{result.base.shape}</span>
                                </div>
                                <div>
                                    <span className="block text-green-700 font-medium">Length</span>
                                    <span className="text-green-900 text-lg">{result.base.length}</span>
                                </div>
                                <div>
                                    <span className="block text-green-700 font-medium">Art Level</span>
                                    <span className="text-green-900 text-lg">{result.art.level || "None"}</span>
                                </div>
                                <div>
                                    <span className="block text-green-700 font-medium">Est. Price</span>
                                    <span className="text-green-900 text-lg font-bold">${result.estimatedPrice}</span>
                                </div>
                            </div>
                            <div className="mt-4 pt-4 border-t border-green-200">
                                <span className="block text-green-700 font-medium mb-1">AI Description</span>
                                <p className="text-green-900 italic">"{result.aiDescription}"</p>
                            </div>
                        </div>

                        {/* Raw Gemini Data */}
                        <div className="bg-gray-900 text-gray-100 rounded-xl overflow-hidden">
                            <div className="bg-gray-800 px-4 py-3 flex items-center justify-between">
                                <h3 className="font-mono text-sm font-bold flex items-center gap-2">
                                    <Bug className="w-4 h-4 text-purple-400" />
                                    RAW_GEMINI_OUTPUT
                                </h3>
                                <span className="text-xs text-gray-400">Gemini 2.0 Flash</span>
                            </div>
                            <pre className="p-4 text-xs overflow-auto max-h-64">
                                {JSON.stringify(result.modalResult?.gemini_debug || "Not Exposed (Update ai.ts to expose raw gemini)", null, 2)}
                            </pre>
                        </div>

                        {/* Raw Florence Data */}
                        <div className="bg-gray-900 text-gray-100 rounded-xl overflow-hidden">
                            <div className="bg-gray-800 px-4 py-3 flex items-center justify-between">
                                <h3 className="font-mono text-sm font-bold flex items-center gap-2">
                                    <Bug className="w-4 h-4 text-blue-400" />
                                    RAW_FLORENCE_OUTPUT
                                </h3>
                                <span className="text-xs text-gray-400">Florence-2 (Modal)</span>
                            </div>
                            <pre className="p-4 text-xs overflow-auto max-h-64">
                                {JSON.stringify(result.modalResult?.florence || {}, null, 2)}
                            </pre>
                        </div>
                    </>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-200 rounded-xl">
                        <Bug className="w-12 h-12 mb-4 opacity-20" />
                        <p>Upload an image to inspect the AI brain.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

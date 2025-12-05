import { useState, useRef } from 'react';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from '@/lib/firebase';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';

interface ImageUploadProps {
    label: string;
    currentImageUrl?: string;
    onImageUploaded: (url: string) => void;
    path: string; // Storage path prefix (e.g., 'logos', 'banners')
    helperText?: string;
}

export default function ImageUpload({ label, currentImageUrl, onImageUploaded, path, helperText }: ImageUploadProps) {
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [previewUrl, setPreviewUrl] = useState(currentImageUrl || '');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Basic validation
        if (file.size > 5 * 1024 * 1024) { // 5MB limit
            alert("File is too large. Please choose an image under 5MB.");
            return;
        }

        if (!file.type.startsWith('image/')) {
            alert("Please upload an image file.");
            return;
        }

        setUploading(true);
        setProgress(0);

        // Create a local preview immediately
        const objectUrl = URL.createObjectURL(file);
        setPreviewUrl(objectUrl);

        try {
            const timestamp = Date.now();
            const storageRef = ref(storage, `${path}/${timestamp}_${file.name}`);
            const uploadTask = uploadBytesResumable(storageRef, file);

            uploadTask.on('state_changed',
                (snapshot) => {
                    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    setProgress(progress);
                },
                (error) => {
                    console.error("Upload failed:", error);
                    alert("Failed to upload image.");
                    setUploading(false);
                    setPreviewUrl(currentImageUrl || ''); // Revert on failure
                },
                async () => {
                    const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                    onImageUploaded(downloadURL);
                    setUploading(false);
                    setPreviewUrl(downloadURL); // Ensure preview matches final URL
                }
            );
        } catch (error) {
            console.error("Error starting upload:", error);
            setUploading(false);
        }
    };

    const handleRemove = () => {
        setPreviewUrl('');
        onImageUploaded('');
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div className="space-y-2">
            <label className="block text-sm font-bold text-gray-700">{label}</label>

            <div className="flex items-start gap-4">
                {/* Preview Area */}
                <div className="relative group shrink-0">
                    <div className={`w-24 h-24 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden bg-gray-50 ${previewUrl ? 'border-none' : ''}`}>
                        {previewUrl ? (
                            {/* eslint-disable-next-line @next/next/no-img-element */ }
                            < img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                        ) : (
                        <ImageIcon className="text-gray-300" size={32} />
                        )}
                    </div>

                    {/* Remove Button */}
                    {previewUrl && !uploading && (
                        <button
                            onClick={handleRemove}
                            className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full shadow-md hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
                            title="Remove image"
                        >
                            <X size={12} />
                        </button>
                    )}

                    {/* Loading Overlay */}
                    {uploading && (
                        <div className="absolute inset-0 bg-black/50 rounded-xl flex items-center justify-center">
                            <Loader2 className="text-white animate-spin" size={24} />
                        </div>
                    )}
                </div>

                {/* Upload Controls */}
                <div className="flex-1 space-y-2">
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                        id={`file-upload-${label.replace(/\s+/g, '-').toLowerCase()}`}
                        disabled={uploading}
                    />
                    <label
                        htmlFor={`file-upload-${label.replace(/\s+/g, '-').toLowerCase()}`}
                        className={`inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50 cursor-pointer transition-colors ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        <Upload size={16} />
                        {uploading ? `Uploading ${Math.round(progress)}%` : 'Choose Image'}
                    </label>

                    {helperText && (
                        <p className="text-xs text-gray-500">{helperText}</p>
                    )}
                </div>
            </div>
        </div>
    );
}

/**
 * Basic client-side image quality checks.
 * In a real production app, this would use OpenCV.js or a WebAssembly module for true "Variance of Laplacian".
 * For this prototype, we'll use a lightweight brightness/contrast heuristic.
 */

export const isImageBlurry = async (imageSrc: string): Promise<boolean> => {
    return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = "Anonymous";
        img.src = imageSrc;

        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            if (!ctx) {
                resolve(false);
                return;
            }

            // Downscale for performance
            const width = 500;
            const scaleFactor = width / img.width;
            const height = img.height * scaleFactor;

            canvas.width = width;
            canvas.height = height;
            ctx.drawImage(img, 0, 0, width, height);

            const imageData = ctx.getImageData(0, 0, width, height);
            const data = imageData.data;

            // Simple edge detection heuristic (High frequency content check)
            // We calculate the difference between adjacent pixels. 
            // Blurry images have low differences (smooth transitions).
            let totalDiff = 0;
            let pixelCount = 0;

            for (let i = 0; i < data.length; i += 4) {
                // Convert to grayscale
                const r = data[i];
                const g = data[i + 1];
                const b = data[i + 2];
                const gray = 0.299 * r + 0.587 * g + 0.114 * b;

                // Compare with next pixel (horizontal gradient)
                if (i + 4 < data.length) {
                    const nextR = data[i + 4];
                    const nextG = data[i + 5];
                    const nextB = data[i + 6];
                    const nextGray = 0.299 * nextR + 0.587 * nextG + 0.114 * nextB;

                    totalDiff += Math.abs(gray - nextGray);
                    pixelCount++;
                }
            }

            const avgDiff = totalDiff / pixelCount;

            // Threshold determined experimentally. 
            // Sharp images usually have avgDiff > 15-20. 
            // Very blurry images are < 10.
            // LOWERED to 2 to avoid blocking high quality images that might have smooth gradients (like gel nails).
            const BLUR_THRESHOLD = 2;

            console.log(`Image Sharpness Score: ${avgDiff.toFixed(2)}`);
            resolve(avgDiff < BLUR_THRESHOLD);
        };

        img.onerror = () => {
            console.error("Error loading image for blur check");
            resolve(false); // Fail safe
        };
    });
};

export const getImageDimensions = (imageSrc: string): Promise<{ width: number, height: number }> => {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve({ width: img.width, height: img.height });
        img.src = imageSrc;
    });
};

export const compressImage = (file: File, maxWidth = 2048, quality = 0.9): Promise<File> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target?.result as string;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                if (width > maxWidth) {
                    height = Math.round((height * maxWidth) / width);
                    width = maxWidth;
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx?.drawImage(img, 0, 0, width, height);

                canvas.toBlob((blob) => {
                    if (blob) {
                        const compressedFile = new File([blob], file.name, {
                            type: 'image/jpeg',
                            lastModified: Date.now(),
                        });
                        resolve(compressedFile);
                    } else {
                        reject(new Error('Canvas is empty'));
                    }
                }, 'image/jpeg', quality);
            };
            img.onerror = (error) => reject(error);
        };
        reader.onerror = (error) => reject(error);
    });
};

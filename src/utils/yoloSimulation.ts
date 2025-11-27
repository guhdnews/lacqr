/**
 * YOLO Simulation Utility
 * Generates mock segmentation data to test the Hybrid AI Prompt.
 */

export interface YoloData {
    masks: number[][][]; // List of polygons (x,y coordinates)
    boxes: number[][];   // List of bounding boxes [x1, y1, x2, y2]
    pixel_lengths: number[]; // Estimated length of each nail in pixels
    confidence: number;
}

/**
 * Simulates YOLO output for a standard "Long Coffin" set.
 */
export function simulateYoloData(width: number, height: number): YoloData {
    // Simulate 5 nails (Thumb to Pinky)
    // Coffin shape = Tapered sides, flat tip

    const nails = [];
    const boxes = [];
    const lengths = [];

    // Mock positions for 5 fingers
    const positions = [0.1, 0.3, 0.5, 0.7, 0.9];

    for (const x_center of positions) {
        const w = width * 0.15; // Nail width
        const h = height * 0.4; // Nail height (Long)
        const x = x_center * width;
        const y = height * 0.5;

        // Bounding Box
        boxes.push([x - w / 2, y - h / 2, x + w / 2, y + h / 2]);

        // Coffin Shape Polygon (Simplified)
        // Bottom Left, Top Left (tapered), Top Right (tapered), Bottom Right
        const mask = [
            [x - w / 2, y + h / 2], // Base Left
            [x - w / 4, y - h / 2], // Tip Left (Tapered)
            [x + w / 4, y - h / 2], // Tip Right (Tapered)
            [x + w / 2, y + h / 2]  // Base Right
        ];
        nails.push(mask);

        // Pixel Length (Simulating "Long" > 300px)
        lengths.push(400 + Math.random() * 50);
    }

    return {
        masks: nails,
        boxes: boxes,
        pixel_lengths: lengths,
        confidence: 0.95
    };
}

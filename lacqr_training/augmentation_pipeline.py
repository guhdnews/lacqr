import albumentations as A
import cv2

def get_lacqr_pipeline():
    """
    Returns an Albumentations pipeline optimized for YOLOv8 Instance Segmentation.
    Handles:
    1. Geometric changes (Rotation/Scale) - Critical for user camera angles.
    2. Lighting changes - Critical for dark room detection.
    3. Noise/Blur - Critical for low-end phone cameras.
    """
    return A.Compose([
        # --- GEOMETRY (Handling Angles) ---
        # Flips and rotations to handle users taking photos from any side
        A.HorizontalFlip(p=0.5),
        A.ShiftScaleRotate(
            shift_limit=0.0625, 
            scale_limit=0.1, 
            rotate_limit=45, 
            p=0.7
        ),
        
        # --- LIGHTING (Handling Dark Rooms/Flash) ---
        # Critical for the 60% -> 95% accuracy jump
        A.RandomBrightnessContrast(
            brightness_limit=0.3, 
            contrast_limit=0.3, 
            p=0.5
        ),
        A.HueSaturationValue(p=0.3), # Variation in skin tone/polish shade

        # --- CAMERA QUALITY (Handling Lower-End Devices) ---
        A.GaussNoise(var_limit=(10.0, 50.0), p=0.3), # Grainy ISO noise
        A.MotionBlur(blur_limit=7, p=0.3), # Shaky hands
    ], 
    # CRITICAL CONFIG FOR YOLO:
    # 1. format='yolo' ensures bounding box coordinates are normalized (0-1)
    # 2. 'masks' target ensures the polygon shape rotates WITH the image
    bbox_params=A.BboxParams(format='yolo', label_fields=['category_ids']),
    additional_targets={'masks': 'mask'} 
    )

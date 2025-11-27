from ultralytics import YOLO
import os

class LacqrPredictor:
    def __init__(self):
        # Load Main Model
        # Check for custom trained model in backend/models/
        custom_model_path = os.path.join(os.path.dirname(__file__), 'models', 'best.pt')
        
        if os.path.exists(custom_model_path):
            print(f"✅ Loading Custom Trained Model: {custom_model_path}")
            self.main_model = YOLO(custom_model_path)
        else:
            print("⚠️ Custom model not found. Loading Base YOLO11m-seg...")
            self.main_model = YOLO('yolo11m-seg.pt') 
            
        self.retry_model = None # Lazy load strictly for retries to save resources

    def predict(self, image_path, is_retry=False):
        """
        Runs inference on the nail image.
        If is_retry is True, loads the heavier X-Large model for maximum accuracy.
        """
        if is_retry:
            print("Refining scan with X-Large Model...")
            if self.retry_model is None:
                 # Load the "Nuclear Option" only when needed
                 self.retry_model = YOLO('yolo11x-seg.pt')
            model = self.retry_model
        else:
            model = self.main_model

        # Run Inference
        results = model(image_path)
        
        # Process results to extract specific nail data
        return self.process_results(results)

    def process_results(self, results):
        output_data = {
            "masks": [], # For shape analysis
            "boxes": [], # For location
            "confidence": 0.0
        }
        for r in results:
            # Extract Masks (Polygons) -> Critical for separating "Coffin" vs "Ballerina"
            if r.masks:
                # Convert to list of lists for JSON serialization
                output_data["masks"] = [mask.tolist() for mask in r.masks.xy]
            output_data["boxes"] = r.boxes.xyxy.tolist()
            # Handle confidence score safely
            if r.boxes.conf.numel() > 0:
                output_data["confidence"] = float(r.boxes.conf.mean())
            else:
                output_data["confidence"] = 0.0
            
        return output_data

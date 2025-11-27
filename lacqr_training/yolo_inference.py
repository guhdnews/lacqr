from ultralytics import YOLO

class LacqrPredictor:
    def __init__(self):
        # Load Main Model into memory immediately
        # "Medium" offers the best balance of speed vs. accuracy for real-time
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
                output_data["masks"] = r.masks.xy 
            output_data["boxes"] = r.boxes.xyxy.tolist()
            output_data["confidence"] = float(r.boxes.conf.mean())
            
        return output_data

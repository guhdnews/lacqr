import modal
import io
import os
import time
import json
import numpy as np
from fastapi import Response

# --- MODAL CONFIGURATION ---
app = modal.App("lacqr-brain")

# Define the image with all necessary dependencies
image = (
    modal.Image.debian_slim()
    .apt_install("git", "libglib2.0-0", "libsm6", "libxext6", "libxrender-dev", "libgl1")
    .pip_install(
        "ultralytics",
        "opencv-python-headless",
        "numpy",
        "pandas",
        "scikit-learn",
        "pymilvus",
        "requests",
        "Pillow",
        "sahi",
        "torch",
        "torchvision",
        "transformers", # Latest version for Florence-2
        "fastapi",
        "einops", 
        "timm"
    )
    .run_commands(
        "pip install git+https://github.com/facebookresearch/segment-anything-2.git"
    )
    .add_local_file("backend/models/best.pt", "/root/best.pt")
)

# Secrets for Zilliz
zilliz_secret = modal.Secret.from_dict({
    "ZILLIZ_URI": "https://in03-f9edfb5087d38bd.serverless.gcp-us-west1.cloud.zilliz.com",
    "ZILLIZ_TOKEN": "92beb916dedda4db2aa5aeee305e9e56ce655c1916bcd85602a7a59bd1827cc99667bfcef30a9f76335b1996215ce7224bb3a80d"
})

# --- THE BRAIN ---
@app.cls(
    image=image,
    gpu="L4", 
    secrets=[zilliz_secret],
    # keep_warm=1, # REMOVED to save credits
    concurrency_limit=10,
    timeout=600 
)
class LacqrBrain:
    @modal.enter()
    def load_models(self):
        self.yolo = None
        self.yolo_world = None
        self.sam2_predictor = None
        self.florence_model = None
        self.florence_processor = None
        self.dinov2 = None

        try:
            print("🧠 Loading Models (Open-World Stack)...")
            import torch
            from ultralytics import YOLO
            from sam2.build_sam import build_sam2
            from sam2.sam2_image_predictor import SAM2ImagePredictor
            from transformers import AutoProcessor, AutoModelForCausalLM
            from pymilvus import connections

            self.device = "cuda" if torch.cuda.is_available() else "cpu"
            print(f"🚀 Device: {self.device}")

            # 1. Load Custom YOLOv11 (Stage 1A: The Filter/Nail Plate)
            model_path = "/root/best.pt"
            try:
                if os.path.exists(model_path):
                    print(f"✅ Loading Custom YOLOv11: {model_path}")
                    self.yolo = YOLO(model_path)
                else:
                    print("⚠️ Custom model not found, using fallback.")
                    self.yolo = YOLO("yolo11m-seg.pt")
            except Exception as e:
                print(f"❌ Failed to load Custom YOLO: {e}")
                self.yolo = YOLO("yolo11m-seg.pt")

            # 2. Load YOLO-World (Stage 1B: The Microscope)
            try:
                print("🌍 Loading YOLO-World...")
                self.yolo_world = YOLO("yolov8s-world.pt") 
                self.yolo_world.set_classes(["charm", "gem", "sticker", "dried flower", "pearl", "chain", "3d art", "french tip", "chrome"])
            except Exception as e:
                print(f"❌ Failed to load YOLO-World: {e}")

            # 3. Load SAM 2 (Stage 2: The Scalpel)
            try:
                sam2_checkpoint = "sam2_hiera_large.pt"
                if not os.path.exists(sam2_checkpoint):
                    print("Downloading SAM 2 Checkpoint...")
                    os.system(f"wget https://dl.fbaipublicfiles.com/segment_anything_2/072824/{sam2_checkpoint}")
                self.sam2_predictor = SAM2ImagePredictor(build_sam2("sam2_hiera_l.yaml", sam2_checkpoint, device=self.device))
            except Exception as e:
                print(f"❌ Failed to load SAM 2: {e}")

            # 3.5 Load Florence-2 (Stage 3.5: The Scribe)
            try:
                print("📜 Loading Florence-2 (The Scribe)...")
                model_id = "microsoft/Florence-2-base"
                self.florence_model = AutoModelForCausalLM.from_pretrained(model_id, trust_remote_code=True).to(self.device).eval()
                self.florence_processor = AutoProcessor.from_pretrained(model_id, trust_remote_code=True)
            except Exception as e:
                print(f"❌ Failed to load Florence-2: {e}")

            # 4. Load DINOv2 (Stage 3: The Physicist)
            try:
                print("🦖 Loading DINOv2...")
                self.dinov2 = torch.hub.load('facebookresearch/dinov2', 'dinov2_vits14').to(self.device)
                self.dinov2.eval()
            except Exception as e:
                print(f"❌ Failed to load DINOv2: {e}")

            # 5. Connect to Milvus (Stage 4: The Memory)
            try:
                print("🔌 Connecting to Zilliz...")
                connections.connect(
                    alias="default", 
                    uri=os.environ["ZILLIZ_URI"],
                    token=os.environ["ZILLIZ_TOKEN"]
                )
            except Exception as e:
                print(f"❌ Failed to connect to Zilliz: {e}")

            print("✅ Open-World Stack Loaded!")
        
        except Exception as e:
            print(f"🔥 CRITICAL ERROR IN LOAD_MODELS: {e}")
            import traceback
            traceback.print_exc()

    def run_florence(self, image, task_prompt, text_input=None):
        if not self.florence_model or not self.florence_processor:
            return "Florence-2 not loaded"
        
        try:
            if text_input is None:
                prompt = task_prompt
            else:
                prompt = task_prompt + text_input

            inputs = self.florence_processor(text=prompt, images=image, return_tensors="pt").to(self.device)
            generated_ids = self.florence_model.generate(
                input_ids=inputs["input_ids"],
                pixel_values=inputs["pixel_values"],
                max_new_tokens=1024,
                num_beams=3
            )
            generated_text = self.florence_processor.batch_decode(generated_ids, skip_special_tokens=False)[0]
            parsed_answer = self.florence_processor.post_process_generation(generated_text, task=task_prompt, image_size=(image.width, image.height))
            return parsed_answer
        except Exception as e:
            return f"Florence Error: {e}"

    @modal.method()
    def process_pipeline(self, image_url: str):
        import requests
        from PIL import Image
        import numpy as np
        import torch
        
        print(f"📸 Processing: {image_url}")
        
        try:
            # Download Image
            resp = requests.get(image_url, stream=True)
            resp.raise_for_status()
            pil_image = Image.open(resp.raw).convert("RGB")
            width, height = pil_image.size
        except Exception as e:
            return {"error": f"Failed to download/process image: {e}"}

        detections = []
        florence_captions = {}
        material_tags = []

        # --- STAGE 1: THE MICROSCOPE (YOLO + SAHI) ---
        # A. Detect Nail Plates (ROI) with Custom YOLO
        nail_plates = []
        if self.yolo:
            try:
                results = self.yolo(pil_image, imgsz=640)
                for r in results:
                    for box in r.boxes:
                        cls_name = self.yolo.names[int(box.cls[0])]
                        if cls_name in ["nail_plate", "nail", "finger"]:
                            nail_plates.append(box.xyxy[0].cpu().numpy().tolist())
                            detections.append({
                                "box": box.xyxy[0].cpu().numpy().tolist(),
                                "conf": float(box.conf[0]),
                                "label": cls_name,
                                "cls": int(box.cls[0])
                            })
            except Exception as e:
                print(f"❌ Stage 1A Failed: {e}")

        # B. Micro-Detection with YOLO-World (Inside Nail Plates)
        if self.yolo_world and nail_plates:
            try:
                for i, plate_box in enumerate(nail_plates):
                    x1, y1, x2, y2 = map(int, plate_box)
                    x1, y1 = max(0, x1), max(0, y1)
                    x2, y2 = min(width, x2), min(height, y2)
                    
                    nail_crop = pil_image.crop((x1, y1, x2, y2))
                    w_results = self.yolo_world(nail_crop)
                    for r in w_results:
                        for box in r.boxes:
                            bx1, by1, bx2, by2 = box.xyxy[0].cpu().numpy().tolist()
                            global_box = [bx1 + x1, by1 + y1, bx2 + x1, by2 + y1]
                            detections.append({
                                "box": global_box,
                                "conf": float(box.conf[0]),
                                "label": self.yolo_world.names[int(box.cls[0])],
                                "cls": 999
                            })
            except Exception as e:
                print(f"❌ Stage 1B Failed: {e}")

        # --- STAGE 3.5: THE SCRIBE (Florence-2) ---
        if self.florence_model:
            try:
                print("✍️ Generating Florence-2 Captions...")
                # 1. Dense Captioning (Detailed description of the whole image)
                dense_caption = self.run_florence(pil_image, "<MORE_DETAILED_CAPTION>")
                florence_captions["dense"] = dense_caption
                
                # 2. Object Detection (Open Vocabulary check)
                od_result = self.run_florence(pil_image, "<OD>")
                florence_captions["od"] = od_result
                
                print(f"📜 Florence Caption: {dense_caption}")
            except Exception as e:
                print(f"❌ Florence Failed: {e}")
                florence_captions["error"] = str(e)

        # --- STAGE 3: THE PHYSICIST (DINOv2) ---
        if self.dinov2:
            try:
                import torchvision.transforms as T
                transform = T.Compose([
                    T.Resize(256, interpolation=T.InterpolationMode.BICUBIC),
                    T.CenterCrop(224),
                    T.ToTensor(),
                    T.Normalize(mean=(0.485, 0.456, 0.406), std=(0.229, 0.224, 0.225)),
                ])
                img_tensor = transform(pil_image).unsqueeze(0).to(self.device)
                with torch.no_grad():
                    features = self.dinov2(img_tensor)
                    variance = torch.var(features).item()
                    if variance > 0.01:
                        material_tags.append("Complex/Textured")
                    else:
                        material_tags.append("Smooth/Simple")
            except Exception as e:
                print(f"❌ DINOv2 Failed: {e}")

        return {
            "objects": detections,
            "florence": florence_captions,
            "materials": material_tags,
            "meta": {
                "gpu": "L4",
                "stages": ["YOLOv11", "YOLO-World", "Florence-2", "DINOv2"]
            }
        }

@app.function(image=image)
@modal.web_endpoint(method="POST")
def analyze_image(item: dict):
    image_url = item.get("image_url")
    if not image_url:
        return Response(content=json.dumps({"error": "No image_url provided"}), status_code=400, media_type="application/json")
    
    brain = LacqrBrain()
    result = brain.process_pipeline.remote(image_url)
    return Response(content=json.dumps(result), media_type="application/json")

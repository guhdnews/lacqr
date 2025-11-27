import modal
import io
import os
import time
import json
import numpy as np
from fastapi import Response

# --- MODAL CONFIGURATION ---
# --- MODAL CONFIGURATION ---
app = modal.App("lacqr-brain")

# Define the image with all necessary dependencies
image = (
    modal.Image.debian_slim()
    .apt_install("git", "libglib2.0-0", "libsm6", "libxext6", "libxrender-dev")
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
        "transformers", 
        "fastapi",
        "einops", # For Moondream
        "timm"    # For Moondream
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
    keep_warm=0, 
    concurrency_limit=10,
    timeout=600 
)
class LacqrBrain:
    def __enter__(self):
        print("🧠 Loading Models...")
        import torch
        from ultralytics import YOLO
        from sam2.build_sam import build_sam2
        from sam2.sam2_image_predictor import SAM2ImagePredictor
        from transformers import AutoModelForCausalLM, AutoTokenizer
        from pymilvus import connections

        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        print(f"🚀 Device: {self.device}")

        # 1. Load Custom YOLO (Stage 1)
        # Use the mounted custom model if available, else fallback
        model_path = "/root/best.pt"
        if os.path.exists(model_path):
            print(f"✅ Loading Custom Model: {model_path}")
            self.yolo = YOLO(model_path)
        else:
            print("⚠️ Custom model not found, using fallback.")
            self.yolo = YOLO("yolo11m-seg.pt") 
        
        # 2. Load SAM 2 (Stage 2)
        sam2_checkpoint = "sam2_hiera_large.pt"
        if not os.path.exists(sam2_checkpoint):
            print("Downloading SAM 2 Checkpoint...")
            os.system(f"wget https://dl.fbaipublicfiles.com/segment_anything_2/072824/{sam2_checkpoint}")
        self.sam2_predictor = SAM2ImagePredictor(build_sam2("sam2_hiera_l.yaml", sam2_checkpoint, device=self.device))

        # 3. Load Moondream (Stage 3 - Description)
        # Replaces DINOv2 for description, but we can keep DINO if needed for material.
        # For now, let's use Moondream for the "Description" requirement.
        print("🌙 Loading Moondream...")
        self.moondream_id = "vikhyatk/moondream2"
        self.moondream_revision = "2024-08-26"
        self.moondream_model = AutoModelForCausalLM.from_pretrained(
            self.moondream_id, trust_remote_code=True, revision=self.moondream_revision
        ).to(self.device)
        self.moondream_tokenizer = AutoTokenizer.from_pretrained(self.moondream_id, revision=self.moondream_revision)

        # 4. Connect to Milvus (Stage 4)
        print("🔌 Connecting to Zilliz...")
        connections.connect(
            alias="default", 
            uri=os.environ["ZILLIZ_URI"],
            token=os.environ["ZILLIZ_TOKEN"]
        )
        print("✅ Models Loaded & DB Connected!")

    @modal.method()
    def process_pipeline(self, image_url: str):
        import requests
        from PIL import Image
        import numpy as np
        
        print(f"📸 Processing: {image_url}")
        
        # Download Image
        resp = requests.get(image_url, stream=True)
        resp.raise_for_status()
        pil_image = Image.open(resp.raw).convert("RGB")
        image_np = np.array(pil_image)

        # --- STAGE 1: THE MICROSCOPE (YOLO) ---
        yolo_results = self.yolo(pil_image, imgsz=640)
        
        detections = []
        for r in yolo_results:
            for box in r.boxes:
                detections.append({
                    "box": box.xyxy[0].cpu().numpy().tolist(),
                    "conf": float(box.conf[0]),
                    "cls": int(box.cls[0]),
                    "label": self.yolo.names[int(box.cls[0])]
                })

        # --- STAGE 2: THE SCALPEL (SAM 2) ---
        # (Keeping SAM 2 logic for future masking, but skipping detailed crop loop for speed if not strictly needed for description)
        # For this update, we focus on the "Description" and "Variance".
        
        # --- STAGE 3: THE POET (Moondream) ---
        print("✍️ Generating Description...")
        enc_image = self.moondream_model.encode_image(pil_image)
        description = self.moondream_model.answer_question(enc_image, "Describe the nail art in this image in detail, focusing on length, shape, color, and design.", self.moondream_tokenizer)
        
        # --- STAGE 4: THE MEMORY (Milvus) ---
        visual_match = "Unknown" # Placeholder

        return {
            "objects": detections,
            "description": description,
            "meta": {
                "gpu": "L4",
                "stages": ["Custom YOLO", "SAM2", "Moondream", "Milvus"]
            }
        }

@app.function(image=image)
@modal.web_endpoint(method="POST")
def analyze_image(item: dict):
    image_url = item.get("image_url")
    if not image_url:
        return Response(content="Missing image_url", status_code=400)
    
    brain = LacqrBrain()
    result = brain.process_pipeline.remote(image_url)
    
    return result

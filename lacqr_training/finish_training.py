from ultralytics import YOLO
from pathlib import Path

def main():
    # Path to the last checkpoint from the V1 Safe run
    checkpoint_path = Path('runs/segment/lacqr_v1_safe/weights/last.pt')
    
    if not checkpoint_path.exists():
        print(f"❌ Error: Checkpoint not found at {checkpoint_path}")
        return

    print(f"🔄 Loading weights from {checkpoint_path}...")
    print("🎯 Target: 11 more epochs (Total ~15)")

    # Load the model weights (NOT resume=True, so we can set new epochs)
    model = YOLO(checkpoint_path)
    
    # Train for 11 epochs
    # We use a new project/name to avoid confusion
    results = model.train(
        data='combined_data.yaml',
        epochs=11,
        imgsz=640,
        project='runs/segment',
        name='lacqr_v1_final',
        batch=4,      # Keep Safe Mode
        workers=0     # Keep Safe Mode
    )
    
    print(f"🎉 SUCCESS! Final Model saved at: {results.save_dir}/weights/best.pt")

if __name__ == "__main__":
    main()

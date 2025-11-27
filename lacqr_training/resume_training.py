from ultralytics import YOLO
from pathlib import Path

def main():
    # Path to the last checkpoint
    # We found this in runs/segment/lacqr_combined_v12/weights/last.pt
    checkpoint_path = Path('runs/segment/lacqr_v1_safe/weights/last.pt')
    
    if not checkpoint_path.exists():
        print(f"❌ Error: Checkpoint not found at {checkpoint_path}")
        return

    print(f"🔄 Resuming training from {checkpoint_path}...")
    
    # Load the model from the checkpoint
    model = YOLO(checkpoint_path)
    
    # Resume training
    results = model.train(resume=True)
    
    print(f"🎉 SUCCESS! Model saved at: {results.save_dir}/weights/best.pt")

if __name__ == "__main__":
    main()

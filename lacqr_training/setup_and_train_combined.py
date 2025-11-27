import os
import shutil
import yaml
from pathlib import Path
from ultralytics import YOLO

def find_downloads_folder():
    """Robustly finds the Downloads folder."""
    home = Path.home()
    possible_paths = [
        home / "Downloads",
        home / "My Documents" / "Downloads",
    ]
    for path in possible_paths:
        if path.exists():
            return path
    return None

def main():
    project_root = Path.cwd()
    downloads_path = find_downloads_folder()
    
    # Define our targets
    # User requested to skip V2 for now due to time constraints
    datasets = ["lacqrtraining_dataset_v1"] 
    found_datasets = []

    # --- STEP 1: HUNT & MOVE ---
    print("--- Phase 1: Dataset Ingestion ---")
    for ds_name in datasets:
        dest_path = project_root / ds_name
        
        # Check if already in project
        if dest_path.exists():
            print(f"✅ {ds_name} already exists in project root.")
            found_datasets.append(dest_path)
            continue
            
        # Check Downloads
        if downloads_path:
            source_path = downloads_path / ds_name
            if source_path.exists():
                print(f"📦 Found {ds_name} in Downloads. Moving...")
                shutil.move(str(source_path), str(dest_path))
                found_datasets.append(dest_path)
            else:
                print(f"⚠️ Warning: Could not find {ds_name} in Downloads.")
        else:
            print("❌ Error: Could not locate Downloads folder.")

    if not found_datasets:
        print("❌ No datasets found. Aborting.")
        return

    # --- STEP 2: BUILD UNIFIED CONFIG ---
    print("\n--- Phase 2: Building Unified Brain ---")
    
    # We need to construct lists of paths for Train and Val
    train_paths = []
    val_paths = []
    
    # Map class names from the first dataset (assuming consistent schema)
    # Note: If schemas differ, this requires manual intervention, but we assume Roboflow consistency.
    names_config = None 

    for ds_path in found_datasets:
        # Check internal yaml to find class names (only need once)
        local_yaml = ds_path / "data.yaml"
        if local_yaml.exists() and names_config is None:
            with open(local_yaml, 'r') as f:
                d = yaml.safe_load(f)
                names_config = d.get('names')
                nc_config = d.get('nc')

        # Append paths (Roboflow standard structure)
        # We verify if 'train/images' or just 'train' exists
        if (ds_path / "train/images").exists():
            train_paths.append(str(ds_path.absolute() / "train/images"))
        elif (ds_path / "train").exists():
             train_paths.append(str(ds_path.absolute() / "train"))
             
        if (ds_path / "valid/images").exists():
            val_paths.append(str(ds_path.absolute() / "valid/images"))
        elif (ds_path / "valid").exists():
             val_paths.append(str(ds_path.absolute() / "valid"))

    # Fallback: If no validation set found, use training set (not ideal but prevents crash)
    if not val_paths:
        print("⚠️ Warning: No validation set found. Using training set for validation.")
        val_paths = train_paths

    # Create the Combined YAML
    combined_yaml_path = project_root / "combined_data.yaml"
    
    combined_data = {
        'path': str(project_root), # Base path
        'train': train_paths,      # LIST of paths
        'val': val_paths,          # LIST of paths
        'names': names_config if names_config else {0: 'nail'}, # Fallback
        'nc': nc_config if names_config else 1
    }
    
    with open(combined_yaml_path, 'w') as f:
        yaml.dump(combined_data, f)
        
    print(f"✅ Unified Config created at: {combined_yaml_path}")
    print(f"   Training on {len(train_paths)} sources.")

    # --- STEP 3: TRAIN (SAFE MODE) ---
    print("\n--- Phase 3: Launching YOLO11 (Safe Mode) ---")
    print("ℹ️  Running with reduced batch size and workers to prevent crashes.")
    
    model = YOLO('yolo11m-seg.pt')
    
    # SAFE MODE CONFIGURATION:
    # batch=4: Reduces RAM usage significantly.
    # workers=0: Uses main thread only (prevents Windows multiprocessing crashes).
    # device='cpu': Explicitly stating CPU (though auto-detected).
    
    results = model.train(
        data=str(combined_yaml_path),
        epochs=50,
        imgsz=640,
        name='lacqr_v1_safe', # New run name for V1 only
        project='runs/segment',
        batch=4,      # CRITICAL: Reduced from default (16)
        workers=0,    # CRITICAL: Fixes Windows process/RAM issues
        exist_ok=True # Allow overwriting if needed
    )
    
    print(f"🎉 SUCCESS! Combined Model saved at: {results.save_dir}/weights/best.pt")

if __name__ == "__main__":
    main()

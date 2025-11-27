from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from inference import LacqrPredictor
import shutil
import os
import uuid

app = FastAPI()

# Configure CORS
# Allow requests from the React frontend (localhost:5173)
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Predictor
predictor = LacqrPredictor()

# Create temp directory for uploads
UPLOAD_DIR = "temp_uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@app.get("/")
def read_root():
    return {"status": "Lacqr AI Backend is running"}

@app.post("/analyze")
async def analyze_image(file: UploadFile = File(...), is_retry: bool = False):
    try:
        # Generate unique filename
        file_extension = file.filename.split(".")[-1]
        filename = f"{uuid.uuid4()}.{file_extension}"
        file_path = os.path.join(UPLOAD_DIR, filename)

        # Save uploaded file
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # Run Inference
        try:
            result = predictor.predict(file_path, is_retry=is_retry)
        finally:
            # Clean up file after inference
            if os.path.exists(file_path):
                os.remove(file_path)

        return result

    except Exception as e:
        print(f"Error processing image: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

import requests
import json

# Live Modal Endpoint
URL = "https://upfacedevelopment--lacqr-brain-analyze-image.modal.run"

# Test Image (Use a public URL or upload one)
# Using a placeholder image URL for testing, or I can try to use a local file if I can upload it.
# For simplicity, let's use a known public image of nails if possible, or just a generic one.
# Actually, the endpoint expects a URL.
IMAGE_URL = "https://firebasestorage.googleapis.com/v0/b/lacqr-app.appspot.com/o/scans%2Ftest_image.jpg?alt=media" 
# Note: The above URL might not work if I don't have a valid token or file. 
# Let's use a generic public image.
IMAGE_URL = "https://images.unsplash.com/photo-1604654894610-df63bc536371?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"

payload = {
    "image_url": IMAGE_URL
}

print(f"🚀 Sending request to {URL}...")
try:
    response = requests.post(URL, json=payload)
    response.raise_for_status()
    data = response.json()
    
    print("\n✅ Response Received:")
    print(json.dumps(data, indent=2))
    
    # Check for critical fields
    print("\n🔍 Analysis:")
    if "description" in data:
        print(f"  - Description: FOUND ({len(data['description'])} chars)")
    else:
        print("  - Description: MISSING ❌")
        
    objects = data.get("objects", [])
    nail_plates = [obj for obj in objects if obj.get("label") == "nail_plate"]
    print(f"  - Objects Detected: {len(objects)}")
    print(f"  - Nail Plates: {len(nail_plates)}")
    
    if len(nail_plates) == 0:
        print("  - ⚠️ No nail_plate detected! Price will default to base.")

except Exception as e:
    print(f"\n❌ Error: {e}")
    if hasattr(e, 'response') and e.response:
        print(f"  Status: {e.response.status_code}")
        print(f"  Text: {e.response.text}")

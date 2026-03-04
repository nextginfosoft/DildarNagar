"""
File upload router
Handles image uploads for listings
"""
from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
from pathlib import Path
import shutil
import uuid
from datetime import datetime

router = APIRouter(prefix="/upload", tags=["Upload"])

# Uploads directory
UPLOAD_DIR = Path(__file__).resolve().parent.parent.parent / "uploads"
UPLOAD_DIR.mkdir(exist_ok=True)

# Allowed image types
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".gif", ".webp"}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB


@router.post("/image")
async def upload_image(file: UploadFile = File(...)):
    """
    Upload an image file
    Returns the URL to access the uploaded image
    """
    # Validate file extension
    file_ext = Path(file.filename).suffix.lower()
    if file_ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file type. Allowed types: {', '.join(ALLOWED_EXTENSIONS)}"
        )
    
    # Generate unique filename
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    unique_id = str(uuid.uuid4())[:8]
    new_filename = f"{timestamp}_{unique_id}{file_ext}"
    file_path = UPLOAD_DIR / new_filename
    
    # Save file
    try:
        with file_path.open("wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save file: {str(e)}")
    finally:
        file.file.close()
    
    # Return URL to access the file
    file_url = f"/uploads/{new_filename}"
    
    return {
        "success": True,
        "filename": new_filename,
        "url": file_url,
        "message": "Image uploaded successfully"
    }


@router.delete("/image/{filename}")
async def delete_image(filename: str):
    """
    Delete an uploaded image
    """
    file_path = UPLOAD_DIR / filename
    
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="File not found")
    
    try:
        file_path.unlink()
        return {"success": True, "message": "Image deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete file: {str(e)}")

# routers/tts.py

from fastapi import APIRouter, HTTPException
from pathlib import Path
from app.models.tts import (
    ModelRequest, DatasetProcessRequest
)
from app.utils.formatter import list_audios, format_audio_list
from faster_whisper import WhisperModel
import os, traceback, torch
from fastapi import UploadFile, File, Form
from fastapi.responses import JSONResponse
import shutil


tts_router = APIRouter()

VOICE_MODEL_ROOT = Path("voice_models")  # Root folder for storing all models
VOICE_MODEL_ROOT.mkdir(exist_ok=True)    # Ensure root exists


def clear_gpu_cache():
    # clear the GPU cache
    if torch.cuda.is_available():
        torch.cuda.empty_cache()


   

@tts_router.post("/createNewModelDir")
async def create_new_model_dir(request: ModelRequest):
    model_name = request.name.strip()

    if not model_name:
        raise HTTPException(status_code=400, detail="Model name is required.")

    target_path = VOICE_MODEL_ROOT / model_name

    try:
        target_path.mkdir(parents=True, exist_ok=True)  # ✅ Allow folder if it already exists
        return {"message": f"Folder '{model_name}' is ready."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))



 # Full absolute path where user audio is uploaded

@tts_router.post("/process-dataset")
async def process_dataset(
    name: str = Form(...),
    audio_file: UploadFile = File(...)
):    
    clear_gpu_cache()

    try:
        model_name = name.strip()
        if not model_name:
            raise HTTPException(status_code=400, detail="Model name is required.")


        audio_folder = data.audio_folder.strip()
        # Check audio folder
        if not os.path.exists(audio_folder) or not os.path.isdir(audio_folder):
            raise HTTPException(status_code=400, detail="Audio folder is invalid or doesn't exist.")

        # User-defined model path inside voice_models
        base_dir = "voice_models"
        model_dir = os.path.join(base_dir, model_name)
        dataset_dir = os.path.join(model_dir, "dataset")
        run_dir = os.path.join(model_dir, "run")
        train_dir = os.path.join(model_dir, "train")

        os.makedirs(dataset_dir, exist_ok=True)
        os.makedirs(run_dir, exist_ok=True)
        os.makedirs(train_dir, exist_ok=True)


        filename = audio_file.filename
        audio_path = os.path.join(dataset_dir, filename)

        with open(audio_path, "wb") as f:
            shutil.copyfileobj(audio_file.file, f)

        # Validate it's an audio file (optional)
        audio_files = [audio_path]
        if not audio_files:
            raise HTTPException(status_code=400, detail="No valid audio files received.")

        # Collect audio files
        audio_files = list(list_audios(audio_folder))
        if not audio_files:
            raise HTTPException(status_code=400, detail="No audio files found in the provided directory.")

        try:
            # Loading Whisper
            device = "cuda" if torch.cuda.is_available() else "cpu" 
            compute_type = "float16" if device == "cuda" else "float32"
            
            whisper_model = WhisperModel("large-v3", device=device, compute_type=compute_type)
           
             # Format dataset
            train_csv, eval_csv, duration = format_audio_list(
                audio_files=audio_files,
                asr_model=whisper_model,
                target_language="en",
                out_path=dataset_dir,
                # buffer=0.2,
                # eval_percentage=0.15,
                # speaker_name="coqui",
                gradio_progress=None
            )
            
            clear_gpu_cache()

        except:

            clear_gpu_cache()
            traceback.print_exc()
            error = traceback.format_exc()
            raise HTTPException(status_code=500, detail=f"Data processing failed:\n{error}")
    

        return {
            "message": "✅ Dataset processed and saved successfully.",
            "model_dir": model_dir,
            "dataset_dir": dataset_dir,
            "train_csv": train_csv,
            "eval_csv": eval_csv,
            "duration_minutes": round(duration / 60, 2),
            "chunks_count": len(os.listdir(os.path.join(dataset_dir, "wavs")))
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process dataset: {str(e)}")

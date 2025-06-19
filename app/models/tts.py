from pydantic import BaseModel

class ModelRequest(BaseModel):
    name: str

class DatasetProcessRequest(BaseModel):
    name: str
    audio_folder: str 
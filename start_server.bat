@echo off
echo Starting Application at http://localhost:8000...
start "" http://localhost:8000\index.html
call venv\Scripts\activate
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload --log-level warning
pause

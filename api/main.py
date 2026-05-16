import os
import tempfile
from pathlib import Path

from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.responses import JSONResponse

from main import run_analysis_pipeline

app = FastAPI(title="ClauseMatch AI", version="1.0.0")


@app.get("/api/v1/health")
def health():
    return {"status": "ok"}


@app.post("/api/v1/analyze")
async def analyze(
    original_file: UploadFile = File(...),
    amendment_file: UploadFile = File(...),
    model_tier: str = Form("standard"),
):
    os.environ["MODEL_TIER"] = model_tier

    with tempfile.TemporaryDirectory() as tmp:
        original_path = Path(tmp) / original_file.filename
        amendment_path = Path(tmp) / amendment_file.filename

        original_path.write_bytes(await original_file.read())
        amendment_path.write_bytes(await amendment_file.read())

        result = run_analysis_pipeline(str(original_path), str(amendment_path))

    if result is None:
        raise HTTPException(status_code=500, detail="Pipeline failed to produce a result.")

    return JSONResponse(content=result.model_dump())

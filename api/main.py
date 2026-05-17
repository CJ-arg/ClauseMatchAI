import asyncio
import tempfile
from pathlib import Path

from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from main import run_analysis_pipeline

app = FastAPI(title="ClauseMatch AI", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/v1/health")
def health():
    return {"status": "ok"}


@app.post("/api/v1/analyze")
async def analyze(
    original_file: UploadFile = File(...),
    amendment_file: UploadFile = File(...),
    model_tier: str = Form("standard"),
):
    original_bytes, amendment_bytes = await asyncio.gather(
        original_file.read(), amendment_file.read()
    )

    with tempfile.TemporaryDirectory() as tmp:
        original_path = Path(tmp) / original_file.filename
        amendment_path = Path(tmp) / amendment_file.filename

        original_path.write_bytes(original_bytes)
        amendment_path.write_bytes(amendment_bytes)

        result = run_analysis_pipeline(str(original_path), str(amendment_path), model_tier=model_tier)

    if result is None:
        raise HTTPException(status_code=500, detail="Pipeline failed to produce a result.")

    return JSONResponse(content=result.model_dump())

# Plan — Phase 5: FastAPI REST Endpoint

Complete groups in order — each group depends on the previous.

---

## Group 1 — Dependencies

1. Add `fastapi`, `python-multipart`, `uvicorn`, and `httpx` to `pyproject.toml` via `uv add`.

---

## Group 2 — API app (`api/main.py`)

2. Create `api/__init__.py` (empty).
3. Create `api/main.py` with:
   - `GET /api/v1/health` → `{"status": "ok"}`
   - `POST /api/v1/analyze`:
     - Accepts `multipart/form-data`: `original_file: UploadFile`, `amendment_file: UploadFile`, `model_tier: str = "standard"`
     - Saves both files to a `tempfile.TemporaryDirectory`
     - Sets `MODEL_TIER` env var from the request field before calling the pipeline
     - Calls `run_analysis_pipeline(original_path, amendment_path)`
     - Returns `ContractChangeOutput` as JSON on success
     - Raises `HTTPException(500)` with detail message if pipeline returns `None`

---

## Group 3 — Integration tests (`tests/test_api.py`)

4. Create `tests/test_api.py` using FastAPI `TestClient` (from `httpx`):
   - `test_health_returns_ok` — GET `/api/v1/health` → 200 `{"status": "ok"}`
   - `test_analyze_returns_contract_change_output` — POST two real `.txt` fixture files → 200, response validates against `ContractChangeOutput`
   - `test_analyze_missing_file_returns_422` — POST with only one file → 422
   - `test_analyze_pipeline_failure_returns_500` — mock `run_analysis_pipeline` to return `None` → 500
5. Run `python -m pytest tests/ -v` — all green.

---

## Group 4 — Manual smoke test

6. Start the server: `uvicorn api.main:app --reload`
7. Run curl against the two rental contract PDFs:
   ```bash
   curl -F "original_file=@data/test_contracts/CONTRATO DE ALQUILER version 1 henry.pdf" \
        -F "amendment_file=@data/test_contracts/CONTRATO DE ALQUILER version 2 henry.pdf" \
        http://localhost:8000/api/v1/analyze
   ```
8. Confirm response is valid `ContractChangeOutput` JSON.

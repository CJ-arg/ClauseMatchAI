# Roadmap

Each phase is a small, independently shippable unit of work. Complete one before starting the next.

---

## Phase 0-2 — Cost reduction sprint (cleanup + text extraction + cheaper model) ✅

**Goal:** eliminate Vision OCR cost, drop the default model to gpt-4o-mini, and remove demo artifacts — all in one pass since the three changes don't conflict.

- Delete `image-1.png`, `image.png`
- Add `python-docx` to `pyproject.toml`
- Create `src/document_parser.py` — `parse_document(path: str) -> str` supporting `.pdf` (PyMuPDF text mode), `.docx` (python-docx), `.txt` (stdlib)
- Add `MODEL_TIER` env var (`standard` | `premium`; default `standard`); map to `gpt-4o-mini` / `gpt-4o` in both agents
- Update `main.py` to call `parse_document()` directly — no more image conversion step
- Replace `tests/test_image_parser.py` with `tests/test_document_parser.py`
- Update `tests/test_pipeline.py` to mock `parse_document` instead of `parse_contract_image`
- Update `.env.example` with `MODEL_TIER=standard`
- Remove `src/image_parser.py`, `src/pdf_processor.py`

**Done when:** `uv run pytest tests/ -v` all green; pipeline accepts `.pdf`, `.docx`, or `.txt` files.

---

## Phase 3 — File-hash result cache

**Goal:** zero cost for repeat analysis of identical documents.

- Create `src/cache.py`: SHA-256 hash helper + read/write JSON cache keyed by `(original_hash, amendment_hash)` stored in `.cache/` directory
- In `main.py` / pipeline entry point: check cache before calling agents; write to cache on success
- Add `.cache/` to `.gitignore`
- Add `tests/test_cache.py` covering hit, miss, and hash collision scenarios

**Done when:** running the same two files twice only makes LLM calls on the first run.

---

## Phase 4 — Make Langfuse optional

**Goal:** operators who don't have Langfuse credentials can run the pipeline without errors.

- In `main.py`, check `LANGFUSE_ENABLED` env var (default `false`)
- If disabled, pass a no-op `BaseCallbackHandler` instead of `CallbackHandler()`
- Update `.env.example` with `LANGFUSE_ENABLED=false`
- Confirm pipeline runs cleanly with no Langfuse keys set

**Done when:** `uv run python main.py` works with an empty `.env` (only `OPENAI_API_KEY` set).

---

## Phase 5 — FastAPI REST endpoint

**Goal:** expose the pipeline as a proper HTTP API so it can be called by external systems.

- Add `fastapi` and `python-multipart` to dependencies
- Create `api/main.py` with `POST /api/v1/analyze` accepting `multipart/form-data` (two files + `model_tier`)
- Wire file upload → `parse_document()` → agent pipeline → JSON response
- Add `GET /api/v1/health` endpoint
- Add basic integration test with `httpx` test client
- Update README with API usage example

**Done when:** `curl -F original_file=@contract.pdf -F amendment_file=@amendment.pdf http://localhost:8000/api/v1/analyze` returns a valid `ContractChangeOutput` JSON.

---

## Phase 6 — Next.js frontend UI

**Goal:** give non-technical users a polished web interface to the pipeline.

- Upload page (`/`): drag-and-drop two files, pick model tier (`standard` / `premium`), submit
- Results page (`/results`): display `sections_changed`, `topics_touched`, `summary_of_the_change` in readable cards; download JSON button
- API docs page (`/docs`): minimal reference for integrators
- Call the FastAPI backend at `POST /api/v1/analyze` from the Next.js API route or directly via fetch
- Style with Tailwind CSS + shadcn/ui components
- State management with TanStack Query (loading, error, success states)

**Done when:** a user can upload two files in the browser and see a formatted diff report without touching the terminal.

---

## Phase 7 — Tiered model via API + UI

**Goal:** callers and UI users can request premium quality per-request without changing server config.

- Add `model_tier: Literal["standard", "premium"] = "standard"` to the `POST /api/v1/analyze` request body
- Pass tier down through pipeline to agent initialization
- Add rate limiting or auth check before allowing `premium` tier (placeholder — implementation depends on business model)
- Document pricing/tier difference in API docs

**Done when:** same endpoint returns different quality output depending on `model_tier` parameter.

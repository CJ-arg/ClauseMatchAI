# Tech Stack

## Current State

| Layer | Tool | Status |
|---|---|---|
| Orchestration | LangChain | Kept |
| LLM | OpenAI GPT-4o | **Replace** |
| Vision OCR | GPT-4o Vision (image input) | **Remove** |
| Observability | Langfuse | **Make optional** |
| Output validation | Pydantic v2 | Kept |
| PDF rendering | PyMuPDF (fitz) | Repurposed |
| Env / deps | uv + pyproject.toml | Kept |
| Tests | Pytest + unittest.mock | Kept |
| Frontend | Next.js 15 (App Router) | **Build out** |

---

## Target Architecture

### Document Ingestion (replaces Vision OCR)

Users upload documents directly as **PDF, DOCX, or TXT**. Text is extracted on the server before any LLM call:

- **PDF:** PyMuPDF (`fitz`) — already a dependency, text extraction mode instead of image rendering
- **DOCX:** `python-docx` (add dependency)
- **TXT:** stdlib read

No image conversion, no base64 encoding, no Vision API calls. This is the single largest cost reduction.

### LLM — Tiered Model

| Tier | Model | Use case |
|---|---|---|
| MVP / free | `gpt-4o-mini` | Standard contract diffs, short documents |
| Premium | `gpt-4o` | Complex multi-page contracts, high-stakes review |

The tier is selected per-request via an API parameter (`model_tier: "standard" | "premium"`). Both tiers go through the same agent pipeline; only the `ChatOpenAI` model name changes.

### Result Caching

Cache keyed on `SHA-256(file_bytes)` for each uploaded document. If both hashes match a prior run, return the cached `ContractChangeOutput` without any LLM calls. Storage: filesystem (MVP) → pluggable (Redis, S3) in later phases.

### Observability — Optional

Langfuse is gated behind `LANGFUSE_ENABLED=true` in `.env`. When the key is absent or false, a no-op callback handler is used so the pipeline code doesn't change. Removes the Langfuse dependency from the hot path for operators who don't need it.

### API Surface

FastAPI REST endpoint (to be added):

```
POST /api/v1/analyze
  multipart/form-data:
    original_file: <PDF|DOCX|TXT>
    amendment_file: <PDF|DOCX|TXT>
    model_tier: "standard" | "premium"  (default: "standard")

Response 200:
  ContractChangeOutput (JSON)
```

### Frontend — Next.js 15 (App Router)

The scaffold exists (`src/app/`, `src/components/`) but is empty — all pages and components are to be built.

Key screens:
- **Upload page** (`/`) — drag-and-drop or file picker for two documents; model tier selector
- **Results page** (`/results`) — structured diff view: changed sections, topics, summary; download as JSON
- **API docs page** (`/docs`) — lightweight reference for technical integrators

Stack choices:
- **Tailwind CSS** — already in `node_modules`, use it
- **shadcn/ui** — accessible component primitives, pair with Tailwind
- **React Query (TanStack Query)** — manage async upload + polling state
- Calls the FastAPI backend at `/api/v1/analyze` (Phase 5)

### Removed

- `src/image_parser.py` Vision OCR path — replaced by text extractor
- `src/pdf_processor.py` image conversion — replaced by direct text extraction
- `image-1.png`, `image.png` — demo artifacts, not needed in production

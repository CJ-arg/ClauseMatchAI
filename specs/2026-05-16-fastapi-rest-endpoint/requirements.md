# Requirements — Phase 5: FastAPI REST Endpoint

## Scope

Expose the pipeline as an HTTP API so external systems can submit two contract documents and receive a structured JSON diff. The API is the first public surface of ClauseMatch AI and the backend that the Phase 6 Next.js UI will call.

---

## Context

- **Depends on:** Phase 3 (document parser, cache) and Phase 4 (Langfuse optional) — both merged to main.
- **Mission alignment:** REST API is one of the two delivery surfaces in the mission. Compliance teams integrating into CLM systems need a stable, documented endpoint.
- **Phase 6 dependency:** The Next.js frontend will call `POST /api/v1/analyze` directly. The request/response contract established here must not change without versioning.

---

## Decisions

| Decision | Choice | Reason |
|---|---|---|
| App location | `api/main.py` | Separates HTTP layer from domain logic in `src/` |
| File handling | Save to `tempfile.TemporaryDirectory`, parse, delete on request exit | No changes to `parse_document()` signature; temp dir is cleaned up automatically |
| `POST /api/v1/analyze` input | `multipart/form-data`: `original_file`, `amendment_file` (required); `model_tier` form field (optional, default `standard`) | Matches tech-stack spec; easy to call with curl or fetch |
| `POST /api/v1/analyze` output | `ContractChangeOutput` JSON, HTTP 200 | Same Pydantic model already validated by the pipeline |
| Bad input errors | HTTP 422 (FastAPI built-in validation for missing/wrong fields) | Standard REST; no custom validation logic needed |
| Pipeline failure errors | HTTP 500 with `{"detail": "<message>"}` JSON body | Consistent with FastAPI error format |
| Health endpoint | `GET /api/v1/health` → `{"status": "ok"}` | Required for load balancers and Phase 6 readiness checks |
| Test client | `httpx` via FastAPI `TestClient` | Roadmap spec; zero network required in CI |
| Server entrypoint | `uvicorn api.main:app --reload` | Standard FastAPI dev server |

---

## Out of Scope (Phase 5)

- Authentication or API keys
- Rate limiting
- File size limits
- CORS configuration (Phase 6 will add it when the frontend is wired)
- Async pipeline execution / background tasks

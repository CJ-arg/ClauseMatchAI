# Requirements — Phase 6: Next.js Frontend UI

## Scope

Give non-technical compliance analysts a polished web interface to the pipeline. Users upload two contract documents, click Analyze, and see a formatted diff report — without touching the terminal.

---

## Context

- **Depends on:** Phase 5 (FastAPI REST endpoint) — merged to main.
- **Mission alignment:** Web UI is the second delivery surface in the mission. It targets compliance analysts who need readable output without API integration skills.
- **Phase 7 dependency:** The model tier selector added here will be wired to the API's `model_tier` field in Phase 7.

---

## Decisions

| Decision | Choice | Reason |
|---|---|---|
| Frontend location | `frontend/` subdirectory | Clean separation from Python backend; independent `package.json` |
| Framework | Next.js 15 (App Router) | Already in the tech stack; `src/app/` convention |
| Styling | Tailwind CSS + shadcn/ui | Roadmap spec; fast accessible components |
| State / async | TanStack Query (React Query) | Roadmap spec; handles loading/error/success states cleanly |
| API call method | Direct `fetch` from browser to FastAPI | User decision; simpler than a proxy route |
| CORS | Add `fastapi-cors` middleware to `api/main.py` | Required for browser → FastAPI direct calls |
| Backend URL | `NEXT_PUBLIC_API_URL` env var (default `http://localhost:8000`) | Configurable without code change for staging/prod |
| Pages | `/` upload, `/results` diff report, `/docs` API reference | Roadmap spec |

---

## Pages

### `/` — Upload page
- Drag-and-drop or file picker for **original** and **amendment** documents (PDF/DOCX/TXT)
- Model tier selector (`standard` / `premium`) — UI only in Phase 6; wired in Phase 7
- Submit button → `POST /api/v1/analyze` → redirect to `/results`

### `/results` — Results page
- Displays `sections_changed` as a list of clause badges
- Displays `topics_touched` as topic tags
- Displays `summary_of_the_change` as a readable narrative card
- Download JSON button
- "Analyze another" link back to `/`

### `/docs` — API docs page
- Minimal reference: endpoint, request format, response schema, example curl command

---

## Out of Scope (Phase 6)

- Authentication
- File size validation beyond browser defaults
- Multi-language support
- Dark mode
- Polling / async job queue (analysis is synchronous for now)
- Rate limiting on the frontend

# Plan — Phase 6: Next.js Frontend UI

Complete groups in order.

---

## Group 1 — CORS on FastAPI

1. Add `python-multipart` CORS middleware to `api/main.py`:
   - Allow origins: `http://localhost:3000`
   - Allow methods: `*`
   - Allow headers: `*`

---

## Group 2 — Scaffold Next.js app in `frontend/`

2. Run `npx create-next-app@latest frontend` with these options:
   - TypeScript: yes
   - ESLint: yes
   - Tailwind CSS: yes
   - `src/` directory: yes
   - App Router: yes
   - Turbopack: yes
3. Install additional dependencies inside `frontend/`:
   - `@tanstack/react-query`
   - `shadcn/ui` (`npx shadcn@latest init`)
   - Add shadcn components: `button`, `card`, `badge`, `input`, `label`
4. Add `.env.local` with `NEXT_PUBLIC_API_URL=http://localhost:8000`
5. Add `frontend/.env.local` to root `.gitignore`

---

## Group 3 — Shared types (`frontend/src/types/index.ts`)

6. Define `ContractChangeOutput` TypeScript interface matching the Pydantic model:
   ```ts
   export interface ContractChangeOutput {
     sections_changed: string[]
     topics_touched: string[]
     summary_of_the_change: string
   }
   ```

---

## Group 4 — Upload page (`frontend/src/app/page.tsx`)

7. Build the upload form:
   - Two file inputs (original + amendment) with drag-and-drop via `<input type="file">`
   - Accepted types: `.pdf,.docx,.txt`
   - Submit button — disabled while uploading
   - On submit: `POST` to `NEXT_PUBLIC_API_URL/api/v1/analyze` as `multipart/form-data`
   - On success: store result in `sessionStorage`, push to `/results`
   - On error: display error message inline
   - Loading state: spinner + "Analyzing…" text

---

## Group 5 — Results page (`frontend/src/app/results/page.tsx`)

8. Read result from `sessionStorage` on mount; redirect to `/` if missing.
9. Render three sections using shadcn `Card`:
   - **Sections Changed** — list of clause badges (`Badge` component)
   - **Topics Touched** — topic tags
   - **Summary** — narrative paragraph
10. Download JSON button — triggers `Blob` download of the raw JSON.
11. "Analyze another contract" link → `/`.

---

## Group 6 — API docs page (`frontend/src/app/docs/page.tsx`)

12. Static page with:
    - Endpoint reference: `POST /api/v1/analyze`, `GET /api/v1/health`
    - Request fields table
    - Response schema table
    - Example `curl` command (copyable code block)

---

## Group 7 — Dev run and smoke test

13. Start FastAPI: `uvicorn api.main:app --reload`
14. Start Next.js: `cd frontend && npm run dev`
15. Open `http://localhost:3000` in browser
16. Upload the two rental contract PDFs → confirm results page renders correctly
17. Click Download JSON → confirm file downloads with correct content

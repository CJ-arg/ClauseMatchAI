# Validation — Phase 6: Next.js Frontend UI

## Prerequisites

Both servers must be running:

```bash
# Terminal 1 — FastAPI backend
uvicorn api.main:app --reload

# Terminal 2 — Next.js frontend
cd frontend && npm run dev
```

---

## Golden path smoke test

1. Open `http://localhost:3000` in the browser.
2. Upload `data/test_contracts/CONTRATO DE ALQUILER version 1 henry.pdf` as the original.
3. Upload `data/test_contracts/CONTRATO DE ALQUILER version 2 henry.pdf` as the amendment.
4. Click **Analyze**.
5. Confirm the loading state appears while the request is in flight.
6. Confirm redirect to `/results` with:
   - Sections Changed: `CUARTA`, `QUINTA`, `DECIMO SEPTIMA`, `CONCLUSION`
   - Topics Touched: `Duración`, `Precio`, `Jurisdicción`
   - Summary narrative rendered as text
7. Click **Download JSON** — confirm a `.json` file downloads with the correct structure.
8. Click **Analyze another contract** — confirm redirect back to `/`.

---

## Error state test

1. Submit the upload form with only one file — confirm an inline error message appears (not a crash).

---

## CORS test

1. With both servers running, open browser DevTools → Network tab.
2. Submit an analysis.
3. Confirm the `POST /api/v1/analyze` request to `localhost:8000` succeeds with no CORS errors in the console.

---

## Merge checklist

- [ ] CORS middleware added to `api/main.py`
- [ ] `frontend/` directory scaffolded with Next.js 15, Tailwind, shadcn/ui, TanStack Query
- [ ] Upload page renders and submits correctly
- [ ] Results page displays all three output fields
- [ ] Download JSON button works
- [ ] Error state shown inline on failure
- [ ] `/docs` page renders with endpoint reference
- [ ] No console errors on golden path

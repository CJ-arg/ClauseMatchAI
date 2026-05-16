# Validation — Phase 5: FastAPI REST Endpoint

## Automated gate

```bash
python -m pytest tests/ -v
```

All tests must pass, including the new `tests/test_api.py` suite covering health, successful analysis, missing file (422), and pipeline failure (500).

---

## Manual smoke test

Start the server:

```bash
uvicorn api.main:app --reload
```

Then in a second terminal, clear the cache and hit the endpoint:

```bash
rm -rf .cache
curl -F "original_file=@data/test_contracts/CONTRATO DE ALQUILER version 1 henry.pdf" \
     -F "amendment_file=@data/test_contracts/CONTRATO DE ALQUILER version 2 henry.pdf" \
     http://localhost:8000/api/v1/analyze
```

**Pass:** response is valid JSON with `sections_changed`, `topics_touched`, and `summary_of_the_change` fields.

---

## Health check

```bash
curl http://localhost:8000/api/v1/health
```

**Pass:** `{"status": "ok"}`

---

## Merge checklist

- [ ] `python -m pytest tests/ -v` all green
- [ ] `GET /api/v1/health` returns `{"status": "ok"}`
- [ ] `POST /api/v1/analyze` with two PDFs returns valid `ContractChangeOutput` JSON
- [ ] Missing a file returns HTTP 422
- [ ] `api/` directory exists and is importable
- [ ] `uvicorn`, `fastapi`, `python-multipart`, `httpx` added to `pyproject.toml`

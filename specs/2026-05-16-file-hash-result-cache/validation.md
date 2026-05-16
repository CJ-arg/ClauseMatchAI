# Validation — Phase 3: File-Hash Result Cache

## Automated gate

```
uv run pytest tests/ -v
```

All tests must pass, including the new `tests/test_cache.py` suite covering hit, miss, collision, and all four warning/prompt scenarios (below threshold, above+y, above+n, prompt suppressed).

---

## Manual smoke test

Run the pipeline twice with the same two files and confirm the second run makes no LLM calls.

```bash
# First run — expect LLM calls and a new .cache/ entry
uv run python main.py

# Second run — expect "[Cache] Returning cached result." with no LLM calls
uv run python main.py
```

**Pass:** second run prints the cache hit message and returns immediately (visibly faster, no OpenAI API log lines).

---

## Cache-size warning smoke test

1. Set `CACHE_MAX_SIZE_MB=0` in `.env` (forces threshold to trigger on any non-empty cache).
2. Run the pipeline once to populate the cache.
3. Run again — expect the warning message and `Clear cache now? [y/N]:` prompt.
4. Type `y` — confirm `.cache/` is emptied.
5. Run again — expect a fresh cache miss (LLM call fires, new entry written).
6. Restore `CACHE_MAX_SIZE_MB=50`.

---

## Suppression smoke test

1. Set `CACHE_WARN_PROMPT=false` and `CACHE_MAX_SIZE_MB=0`.
2. Run the pipeline — confirm no warning or prompt appears, pipeline completes normally.

---

## Merge checklist

- [ ] `uv run pytest tests/ -v` all green
- [ ] Second identical run prints `[Cache] Returning cached result.`
- [ ] Cache-size warning and y/n prompt behave correctly
- [ ] `CACHE_WARN_PROMPT=false` suppresses prompt
- [ ] `.cache/` is in `.gitignore`
- [ ] `.env.example` includes `CACHE_MAX_SIZE_MB` and `CACHE_WARN_PROMPT`
- [ ] Phase 6 note added in requirements: replace terminal prompt with browser popup in Next.js UI

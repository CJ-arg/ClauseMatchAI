# Requirements — Phase 3: File-Hash Result Cache

## Scope

Add a filesystem cache that stores the result of every successful pipeline run, keyed by the SHA-256 hashes of both input documents. On repeat runs with identical files, the cache is returned immediately with zero LLM calls. When the cache grows beyond a configurable threshold, the user is warned and given the choice to clear it.

---

## Context

- **Depends on:** Phase 0-2 must be completed first. The cache key is derived from the raw bytes of the files passed to `parse_document()`. Phase 0-2 introduces `parse_document()` and removes the Vision OCR path; Phase 3 cannot be wired into `main.py` until that exists.
- **Mission alignment:** Eliminating repeat LLM cost is the cheapest possible throughput win for compliance analysts who re-run the same document pairs during review cycles.
- **Phase 6 note:** The cache-size warning is a terminal prompt in Phase 3. When the Next.js UI ships (Phase 6), this must be surfaced as a browser popup instead.

---

## Decisions

| Decision | Choice | Reason |
|---|---|---|
| Cache key | `(sha256(original_bytes), sha256(amendment_bytes))` | File-content identity, not file name. Rename-safe. |
| Storage format | JSON file per entry under `.cache/` | Zero extra dependencies; human-inspectable. |
| Entry filename | `{original_hash[:16]}_{amendment_hash[:16]}.json` | Unique, deterministic, readable. |
| Eviction policy | None (accumulate forever) | MVP scope. Manual clear via prompt. |
| Size threshold | `CACHE_MAX_SIZE_MB` env var, default `50` | Configurable without code change. |
| Threshold check timing | Before each pipeline run | Warns before adding more; user can clear immediately. |
| Prompt behaviour | `y` clears all entries; `n` continues | Non-blocking; operator can suppress with `CACHE_WARN_PROMPT=false`. |

---

## Out of Scope (Phase 3)

- TTL-based expiry
- Per-entry invalidation
- Redis or S3 backends
- Browser popup (Phase 6)
- Cache encryption or access control
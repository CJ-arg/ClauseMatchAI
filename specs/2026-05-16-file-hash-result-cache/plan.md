# Plan — Phase 3: File-Hash Result Cache

Each group is independently reviewable. Complete groups in order — Group 2 depends on Group 1, Group 3 depends on Group 2.

---

## Group 1 — Prerequisite gate

> Confirm Phase 0-2 is actually complete before writing any cache code.

1. Verify `src/document_parser.py` exists and exports `parse_document(path: str) -> str`.
2. Verify `src/image_parser.py` and `src/pdf_processor.py` have been deleted.
3. Verify `main.py` calls `parse_document()` (not `parse_contract_image()`).
4. If any of the above are missing, complete Phase 0-2 first — do not proceed.

---

## Group 2 — Core cache module (`src/cache.py`)

5. Create `src/cache.py` with:
   - `hash_file(path: str) -> str` — returns hex SHA-256 of raw file bytes.
   - `cache_key(original_path: str, amendment_path: str) -> tuple[str, str]` — returns `(original_hash, amendment_hash)`.
   - `cache_path(original_hash: str, amendment_hash: str) -> Path` — returns `.cache/{original_hash[:16]}_{amendment_hash[:16]}.json`.
   - `read_cache(original_hash: str, amendment_hash: str) -> ContractChangeOutput | None` — returns parsed model or `None` on miss.
   - `write_cache(original_hash: str, amendment_hash: str, result: ContractChangeOutput) -> None` — writes JSON to `.cache/`, creating the dir if needed.
6. Add `.cache/` to `.gitignore`.

---

## Group 3 — Cache size warning + interactive prompt

7. Add to `src/cache.py`:
   - `cache_size_mb() -> float` — sums sizes of all `.json` files in `.cache/`.
   - `warn_if_large(threshold_mb: float | None = None) -> None`:
     - Reads `CACHE_MAX_SIZE_MB` env var (default `50`).
     - If `cache_size_mb() >= threshold_mb` and `CACHE_WARN_PROMPT != "false"`:
       - Prints a warning showing current size and threshold.
       - Prompts `Clear cache now? [y/N]: `.
       - On `y`: deletes all `.json` files in `.cache/` and prints confirmation.
       - On `n` / any other input: continues silently.

---

## Group 4 — Wire into pipeline (`main.py`)

8. In `run_analysis_pipeline()`:
   - Call `warn_if_large()` at the top of the function (before any LLM call).
   - Compute `original_hash, amendment_hash = cache_key(original_path, amendment_path)`.
   - Call `read_cache(...)`. If hit, print `[Cache] Returning cached result.` and return immediately.
   - On successful pipeline completion, call `write_cache(...)` before returning.
9. Update `.env.example`:
   - Add `CACHE_MAX_SIZE_MB=50`
   - Add `CACHE_WARN_PROMPT=true`

---

## Group 5 — Tests (`tests/test_cache.py`)

10. Write `tests/test_cache.py` covering:
    - **hit:** write a result, read it back — returns equal `ContractChangeOutput`.
    - **miss:** read with no prior write — returns `None`.
    - **hash collision guard:** two different file contents produce different hashes.
    - **size warning — below threshold:** `warn_if_large()` with a small cache does not prompt.
    - **size warning — above threshold, user says y:** cache files are deleted.
    - **size warning — above threshold, user says n:** cache files are kept.
    - **CACHE_WARN_PROMPT=false suppresses prompt:** no input/output interaction regardless of size.
11. Run `uv run pytest tests/ -v` — all tests must be green.

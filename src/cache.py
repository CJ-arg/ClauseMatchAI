import hashlib
import os
from pathlib import Path

from src.models import ContractChangeOutput

CACHE_DIR = Path(".cache")


def hash_file(path: str) -> str:
    with open(path, "rb") as f:
        return hashlib.sha256(f.read()).hexdigest()


def cache_key(original_path: str, amendment_path: str) -> tuple[str, str]:
    return hash_file(original_path), hash_file(amendment_path)


def cache_path(original_hash: str, amendment_hash: str) -> Path:
    return CACHE_DIR / f"{original_hash[:16]}_{amendment_hash[:16]}.json"


def read_cache(original_hash: str, amendment_hash: str) -> ContractChangeOutput | None:
    p = cache_path(original_hash, amendment_hash)
    if not p.exists():
        return None
    return ContractChangeOutput.model_validate_json(p.read_text(encoding="utf-8"))


def write_cache(original_hash: str, amendment_hash: str, result: ContractChangeOutput) -> None:
    CACHE_DIR.mkdir(exist_ok=True)
    cache_path(original_hash, amendment_hash).write_text(
        result.model_dump_json(), encoding="utf-8"
    )


def cache_size_mb() -> float:
    if not CACHE_DIR.exists():
        return 0.0
    return sum(f.stat().st_size for f in CACHE_DIR.glob("*.json")) / (1024 * 1024)


def warn_if_large(threshold_mb: float | None = None) -> None:
    if threshold_mb is None:
        threshold_mb = float(os.getenv("CACHE_MAX_SIZE_MB", "50"))

    if cache_size_mb() < threshold_mb:
        return

    if os.getenv("CACHE_WARN_PROMPT", "true").lower() == "false":
        return

    size = cache_size_mb()
    print(f"\n[Cache] Warning: cache is {size:.2f} MB (threshold: {threshold_mb:.0f} MB).")
    answer = input("Clear cache now? [y/N]: ").strip().lower()
    if answer == "y":
        for f in CACHE_DIR.glob("*.json"):
            f.unlink()
        print("[Cache] Cache cleared.")

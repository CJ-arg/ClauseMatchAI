"""
Tests for src/cache.py covering hit, miss, collision guard, and warning/prompt scenarios.
"""
import pytest
from unittest.mock import patch
from src.models import ContractChangeOutput
from src import cache as cache_mod


SAMPLE_RESULT = ContractChangeOutput(
    sections_changed=["PRIMERA"],
    topics_touched=["Duración"],
    summary_of_the_change="El plazo cambió de 2 a 3 años.",
)


@pytest.fixture(autouse=True)
def isolated_cache(tmp_path, monkeypatch):
    """Redirect CACHE_DIR to a temp directory so tests never touch .cache/."""
    monkeypatch.setattr(cache_mod, "CACHE_DIR", tmp_path / ".cache")


# ---------------------------------------------------------------------------
# hash_file
# ---------------------------------------------------------------------------

class TestHashFile:

    def test_returns_64_char_hex_string(self, tmp_path):
        f = tmp_path / "doc.txt"
        f.write_bytes(b"hello")
        result = cache_mod.hash_file(str(f))
        assert isinstance(result, str)
        assert len(result) == 64

    def test_different_content_produces_different_hash(self, tmp_path):
        a = tmp_path / "a.txt"
        b = tmp_path / "b.txt"
        a.write_bytes(b"content_a")
        b.write_bytes(b"content_b")
        assert cache_mod.hash_file(str(a)) != cache_mod.hash_file(str(b))

    def test_identical_content_produces_same_hash(self, tmp_path):
        a = tmp_path / "a.txt"
        b = tmp_path / "b.txt"
        a.write_bytes(b"same_content")
        b.write_bytes(b"same_content")
        assert cache_mod.hash_file(str(a)) == cache_mod.hash_file(str(b))


# ---------------------------------------------------------------------------
# read_cache / write_cache
# ---------------------------------------------------------------------------

class TestReadWriteCache:

    def test_miss_returns_none(self):
        assert cache_mod.read_cache("abc123", "def456") is None

    def test_write_then_read_returns_equal_result(self):
        cache_mod.write_cache("abc123", "def456", SAMPLE_RESULT)
        loaded = cache_mod.read_cache("abc123", "def456")
        assert loaded is not None
        assert loaded.sections_changed == SAMPLE_RESULT.sections_changed
        assert loaded.topics_touched == SAMPLE_RESULT.topics_touched
        assert loaded.summary_of_the_change == SAMPLE_RESULT.summary_of_the_change

    def test_different_key_pair_is_a_miss(self):
        cache_mod.write_cache("aaa", "bbb", SAMPLE_RESULT)
        assert cache_mod.read_cache("ccc", "ddd") is None

    def test_write_creates_cache_dir_automatically(self):
        assert not cache_mod.CACHE_DIR.exists()
        cache_mod.write_cache("aaa", "bbb", SAMPLE_RESULT)
        assert cache_mod.CACHE_DIR.exists()


# ---------------------------------------------------------------------------
# warn_if_large
# ---------------------------------------------------------------------------

class TestCacheSizeWarning:

    def _fill_cache(self, size_bytes: int):
        cache_mod.CACHE_DIR.mkdir(parents=True, exist_ok=True)
        (cache_mod.CACHE_DIR / "entry.json").write_bytes(b"x" * size_bytes)

    def test_no_prompt_when_below_threshold(self, monkeypatch):
        self._fill_cache(1024)  # 1 KB << 50 MB default
        monkeypatch.setenv("CACHE_MAX_SIZE_MB", "50")
        with patch("builtins.input") as mock_input:
            cache_mod.warn_if_large()
            mock_input.assert_not_called()

    def test_prompt_shown_when_above_threshold(self, monkeypatch):
        self._fill_cache(1024)
        monkeypatch.setenv("CACHE_MAX_SIZE_MB", "0")
        monkeypatch.setenv("CACHE_WARN_PROMPT", "true")
        with patch("builtins.input", return_value="n") as mock_input:
            cache_mod.warn_if_large()
            mock_input.assert_called_once()

    def test_user_confirms_clears_cache(self, monkeypatch):
        self._fill_cache(1024)
        monkeypatch.setenv("CACHE_MAX_SIZE_MB", "0")
        monkeypatch.setenv("CACHE_WARN_PROMPT", "true")
        with patch("builtins.input", return_value="y"):
            cache_mod.warn_if_large()
        assert not any(cache_mod.CACHE_DIR.glob("*.json"))

    def test_user_declines_keeps_cache(self, monkeypatch):
        self._fill_cache(1024)
        monkeypatch.setenv("CACHE_MAX_SIZE_MB", "0")
        monkeypatch.setenv("CACHE_WARN_PROMPT", "true")
        with patch("builtins.input", return_value="n"):
            cache_mod.warn_if_large()
        assert any(cache_mod.CACHE_DIR.glob("*.json"))

    def test_prompt_suppressed_by_env_false(self, monkeypatch):
        self._fill_cache(1024)
        monkeypatch.setenv("CACHE_MAX_SIZE_MB", "0")
        monkeypatch.setenv("CACHE_WARN_PROMPT", "false")
        with patch("builtins.input") as mock_input:
            cache_mod.warn_if_large()
            mock_input.assert_not_called()

    def test_empty_cache_dir_reports_zero_mb(self):
        cache_mod.CACHE_DIR.mkdir(parents=True, exist_ok=True)
        assert cache_mod.cache_size_mb() == 0.0

    def test_nonexistent_cache_dir_reports_zero_mb(self):
        assert cache_mod.cache_size_mb() == 0.0

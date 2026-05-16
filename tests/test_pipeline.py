"""
Integration test for the full analysis pipeline.
All external calls (OpenAI, Langfuse, cache) are mocked.
"""
import pytest
from unittest.mock import patch, MagicMock
from pydantic import ValidationError
from src.models import ContractChangeOutput
from main import run_analysis_pipeline, validate_paths


class TestValidatePaths:
    """Tests for the validate_paths() helper."""

    def test_existing_file_returns_true(self):
        assert validate_paths("main.py") is True

    def test_nonexistent_file_returns_false(self):
        assert validate_paths("archivo_inexistente.xyz") is False

    def test_list_of_existing_files(self):
        assert validate_paths(["main.py", "pyproject.toml"]) is True

    def test_list_with_missing_file(self):
        assert validate_paths(["main.py", "no_existe.txt"]) is False


class TestRunAnalysisPipeline:
    """Integration tests for the pipeline orchestrator (all LLM and cache calls mocked)."""

    @patch("main.write_cache")
    @patch("main.read_cache", return_value=None)
    @patch("main.cache_key", return_value=("hash_a", "hash_b"))
    @patch("main.warn_if_large")
    @patch("main.ExtractionAgent")
    @patch("main.ContextualizationAgent")
    @patch("main.parse_document")
    def test_successful_pipeline(
        self, mock_parse, mock_ctx_class, mock_ext_class,
        mock_warn, mock_cache_key, mock_read_cache, mock_write_cache,
    ):
        mock_parse.side_effect = ["Texto del contrato original.", "Texto de la adenda."]

        mock_ctx = MagicMock()
        mock_ctx.analyze.return_value = "Mapa: Cláusula 1 original = Cláusula 1 adenda."
        mock_ctx_class.return_value = mock_ctx

        expected = ContractChangeOutput(
            sections_changed=["PRIMERA"],
            topics_touched=["Duración"],
            summary_of_the_change="El plazo se extendió de 2 a 3 años.",
        )
        mock_ext = MagicMock()
        mock_ext.extract_diff.return_value = expected
        mock_ext_class.return_value = mock_ext

        result = run_analysis_pipeline("original.txt", "amendment.txt")

        assert isinstance(result, ContractChangeOutput)
        assert result.sections_changed == ["PRIMERA"]
        mock_write_cache.assert_called_once_with("hash_a", "hash_b", expected)
        call_args = mock_ext.extract_diff.call_args
        assert "Mapa:" in call_args[0][2]

    @patch("main.write_cache")
    @patch("main.read_cache", return_value=None)
    @patch("main.cache_key", return_value=("hash_a", "hash_b"))
    @patch("main.warn_if_large")
    @patch("main.parse_document")
    def test_pipeline_handles_validation_error(
        self, mock_parse, mock_warn,
        mock_cache_key, mock_read_cache, mock_write_cache,
    ):
        mock_parse.side_effect = ValidationError.from_exception_data(
            title="ContractChangeOutput", line_errors=[], input_type="python",
        )
        result = run_analysis_pipeline("original.txt", "amendment.txt")
        assert result is None

    @patch("main.write_cache")
    @patch("main.read_cache", return_value=None)
    @patch("main.cache_key", return_value=("hash_a", "hash_b"))
    @patch("main.warn_if_large")
    @patch("main.parse_document")
    def test_pipeline_handles_generic_exception(
        self, mock_parse, mock_warn,
        mock_cache_key, mock_read_cache, mock_write_cache,
    ):
        mock_parse.side_effect = Exception("Connection refused")
        result = run_analysis_pipeline("original.txt", "amendment.txt")
        assert result is None

    @patch("main.write_cache")
    @patch("main.read_cache")
    @patch("main.cache_key", return_value=("hash_a", "hash_b"))
    @patch("main.warn_if_large")
    def test_cache_hit_skips_agents_and_write(
        self, mock_warn, mock_cache_key, mock_read_cache, mock_write_cache,
    ):
        expected = ContractChangeOutput(
            sections_changed=["PRIMERA"],
            topics_touched=["Duración"],
            summary_of_the_change="Cached result.",
        )
        mock_read_cache.return_value = expected

        result = run_analysis_pipeline("original.txt", "amendment.txt")

        assert result == expected
        mock_write_cache.assert_not_called()

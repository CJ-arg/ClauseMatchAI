"""
Integration tests for the FastAPI REST endpoint.
Pipeline and cache calls are mocked — no LLM or disk I/O required.
"""
import pytest
from unittest.mock import patch
from fastapi.testclient import TestClient
from src.models import ContractChangeOutput
from api.main import app

client = TestClient(app)

SAMPLE_RESULT = ContractChangeOutput(
    sections_changed=["PRIMERA"],
    topics_touched=["Duración"],
    summary_of_the_change="El plazo se extendió de 2 a 3 años.",
)

TXT_FILE = b"Contrato de prueba con clausulas de ejemplo."


class TestHealthEndpoint:

    def test_health_returns_ok(self):
        response = client.get("/api/v1/health")
        assert response.status_code == 200
        assert response.json() == {"status": "ok"}


class TestAnalyzeEndpoint:

    @patch("api.main.run_analysis_pipeline", return_value=SAMPLE_RESULT)
    def test_analyze_returns_contract_change_output(self, mock_pipeline):
        response = client.post(
            "/api/v1/analyze",
            files={
                "original_file": ("original.txt", TXT_FILE, "text/plain"),
                "amendment_file": ("amendment.txt", TXT_FILE, "text/plain"),
            },
        )
        assert response.status_code == 200
        body = response.json()
        assert body["sections_changed"] == ["PRIMERA"]
        assert body["topics_touched"] == ["Duración"]
        assert "summary_of_the_change" in body

    @patch("api.main.run_analysis_pipeline", return_value=SAMPLE_RESULT)
    def test_analyze_passes_model_tier(self, mock_pipeline):
        import os
        client.post(
            "/api/v1/analyze",
            files={
                "original_file": ("original.txt", TXT_FILE, "text/plain"),
                "amendment_file": ("amendment.txt", TXT_FILE, "text/plain"),
            },
            data={"model_tier": "premium"},
        )
        assert os.environ.get("MODEL_TIER") == "premium"

    def test_analyze_missing_file_returns_422(self):
        response = client.post(
            "/api/v1/analyze",
            files={
                "original_file": ("original.txt", TXT_FILE, "text/plain"),
                # amendment_file intentionally missing
            },
        )
        assert response.status_code == 422

    @patch("api.main.run_analysis_pipeline", return_value=None)
    def test_analyze_pipeline_failure_returns_500(self, mock_pipeline):
        response = client.post(
            "/api/v1/analyze",
            files={
                "original_file": ("original.txt", TXT_FILE, "text/plain"),
                "amendment_file": ("amendment.txt", TXT_FILE, "text/plain"),
            },
        )
        assert response.status_code == 500
        assert "detail" in response.json()

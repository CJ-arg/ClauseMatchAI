"""
Tests for document_parser module.
Verifies PDF, DOCX, and TXT extraction without touching real files or APIs.
"""
import pytest
from unittest.mock import patch, MagicMock
from src.document_parser import parse_document


class TestParseDocument:

    def test_txt_file_returns_content(self, tmp_path):
        f = tmp_path / "contract.txt"
        f.write_text("This is a contract.", encoding="utf-8")
        assert parse_document(str(f)) == "This is a contract."

    @patch("src.document_parser.fitz")
    def test_pdf_extracts_text_from_pages(self, mock_fitz):
        mock_page = MagicMock()
        mock_page.get_text.return_value = "Contract text from PDF."
        mock_doc = MagicMock()
        mock_doc.__iter__ = MagicMock(return_value=iter([mock_page]))
        mock_fitz.open.return_value = mock_doc

        result = parse_document("contract.pdf")

        assert "Contract text from PDF." in result
        mock_fitz.open.assert_called_once_with("contract.pdf")

    @patch("src.document_parser.docx")
    def test_docx_extracts_paragraph_text(self, mock_docx):
        mock_para = MagicMock()
        mock_para.text = "Paragraph text."
        mock_document = MagicMock()
        mock_document.paragraphs = [mock_para]
        mock_docx.Document.return_value = mock_document

        result = parse_document("contract.docx")

        assert "Paragraph text." in result
        mock_docx.Document.assert_called_once_with("contract.docx")

    def test_unsupported_extension_raises_value_error(self):
        with pytest.raises(ValueError, match="Unsupported"):
            parse_document("contract.jpg")

    @patch("src.document_parser.fitz")
    def test_pdf_multi_page_joined_with_newlines(self, mock_fitz):
        pages = [MagicMock(), MagicMock()]
        pages[0].get_text.return_value = "Page 1."
        pages[1].get_text.return_value = "Page 2."
        mock_doc = MagicMock()
        mock_doc.__iter__ = MagicMock(return_value=iter(pages))
        mock_fitz.open.return_value = mock_doc

        result = parse_document("contract.pdf")

        assert result == "Page 1.\nPage 2."

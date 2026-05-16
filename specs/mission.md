# Mission

## Problem

Enterprise compliance analysts manually compare original contracts against their amendments (addenda) — a slow, error-prone process that consumes legal review hours on low-value mechanical work. A missed clause modification can carry material legal or financial risk.

## What We Build

ClauseMatch AI is an autonomous multi-agent pipeline that ingests two contract documents (original + amendment), identifies structural relationships between them, and extracts a precise, machine-readable diff of every addition, deletion, and modification — delivered as a validated JSON report.

## Who It Is For

**Primary user:** Compliance analysts and legal operations teams at enterprises who process contract amendments at volume and need deterministic, auditable output they can pipe into downstream workflows (CLM systems, audit logs, dashboards).

**Delivery model:** Two surfaces:
- **Web UI** — non-technical analysts upload two documents, click analyze, and get a readable diff report in the browser.
- **REST API** — technical teams integrate the JSON output directly into CLM systems, audit pipelines, or internal dashboards.

## Core Promise

- **Accurate over fast:** long-context ingestion preserves legal semantics that chunk-based RAG would break.
- **Cheap to run:** text extraction from uploaded files (PDF / DOCX / TXT) replaces expensive Vision OCR. A tiered model allows a low-cost MVP path with an opt-in premium tier for higher-quality extractions.
- **Production-safe output:** every response is validated by a strict Pydantic schema before leaving the system.

## Out of Scope (v1)

- Real-time collaboration or document storage
- Multi-jurisdiction legal interpretation or legal advice
- Authentication / multi-tenant user management

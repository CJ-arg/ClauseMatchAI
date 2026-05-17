import os
from dotenv import load_dotenv
from pydantic import ValidationError
from src.document_parser import parse_document
from src.cache import cache_key, read_cache, write_cache, warn_if_large
from src.agents.contextualization_agent import ContextualizationAgent
from src.agents.extraction_agent import ExtractionAgent

load_dotenv()


def run_analysis_pipeline(original_path: str, amendment_path: str, model_tier: str | None = None):
    print("\n--- Starting ClauseMatch AI Analysis Pipeline ---")

    if model_tier is None:
        model_tier = os.getenv("MODEL_TIER", "standard")

    warn_if_large()

    original_hash, amendment_hash = cache_key(original_path, amendment_path)
    cached = read_cache(original_hash, amendment_hash)
    if cached is not None:
        print("[Cache] Returning cached result.")
        return cached

    if os.getenv("LANGFUSE_ENABLED", "false").lower() == "true":
        from langfuse.langchain import CallbackHandler
        handler = CallbackHandler()
    else:
        handler = None

    try:
        print("Step 1: Parsing documents...")
        original_text = parse_document(original_path)
        amendment_text = parse_document(amendment_path)

        print("Step 2: Analyzing document structure...")
        agent_1 = ContextualizationAgent(model_tier=model_tier)
        structural_map = agent_1.analyze(
            original_text, amendment_text,
            run_name="contextualization_agent", langfuse_handler=handler,
        )

        print("Step 3: Extracting changes and validating with Pydantic...")
        agent_2 = ExtractionAgent(model_tier=model_tier)
        final_report = agent_2.extract_diff(
            original_text, amendment_text, structural_map,
            run_name="extraction_agent", langfuse_handler=handler,
        )

        write_cache(original_hash, amendment_hash, final_report)
        print("--- Analysis Pipeline Completed ---\n")
        return final_report

    except ValidationError as ve:
        print("\n[Error de Validación] El modelo devolvió un formato incorrecto:")
        print(ve)
        return None
    except Exception as e:
        print("\n[Error en Pipeline] Ha ocurrido un error inesperado:")
        print(e)
        return None


def validate_paths(paths):
    if isinstance(paths, str):
        return os.path.exists(paths)
    return all(os.path.exists(p) for p in paths)


if __name__ == "__main__":
    ORIGINAL_INPUT = "data/test_contracts/CONTRATO DE ALQUILER version 1 henry.pdf"
    AMENDMENT_INPUT = "data/test_contracts/CONTRATO DE ALQUILER version 2 henry.pdf"

    if validate_paths(ORIGINAL_INPUT) and validate_paths(AMENDMENT_INPUT):
        result = run_analysis_pipeline(ORIGINAL_INPUT, AMENDMENT_INPUT)
        if result:
            print("FINAL STRUCTURED REPORT (JSON):")
            print(result.model_dump_json(indent=2))
        else:
            print("El proceso terminó sin un resultado válido.")
    else:
        print(f"Error: Files not found — {ORIGINAL_INPUT}, {AMENDMENT_INPUT}")

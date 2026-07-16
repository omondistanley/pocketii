from pathlib import Path

from jinja2 import Environment


TEMPLATES_DIR = Path(__file__).resolve().parents[2] / "frontend" / "templates"
STATIC_JS_DIR = Path(__file__).resolve().parents[2] / "frontend" / "static" / "js"


def test_all_frontend_templates_parse() -> None:
    """Catch truncated or syntactically invalid Jinja before deployment."""
    environment = Environment(autoescape=True)
    templates = sorted(TEMPLATES_DIR.rglob("*.html"))
    assert templates, "No frontend templates were discovered"

    failures: list[str] = []
    for template in templates:
        source = template.read_text(encoding="utf-8")
        try:
            environment.parse(source)
        except Exception as exc:  # pragma: no cover - assertion reports exact file
            failures.append(f"{template.relative_to(TEMPLATES_DIR)}: {exc}")

    assert not failures, "Invalid Jinja templates:\n" + "\n".join(failures)


def test_redesign_layout_contains_complete_document() -> None:
    layout = (TEMPLATES_DIR / "redesign" / "layout.html").read_text(encoding="utf-8")
    assert "{% block content %}" in layout
    assert "{% block scripts %}" in layout
    assert "redesign-phase4.css" in layout
    assert "</body></html>" in layout


def test_guidance_disclosures_are_persistent() -> None:
    guidance = (TEMPLATES_DIR / "recommendations.html").read_text(encoding="utf-8").lower()
    guidance_js = (STATIC_JS_DIR / "redesign-guidance.js").read_text(encoding="utf-8").lower()
    investments = (TEMPLATES_DIR / "investments.html").read_text(encoding="utf-8").lower()

    assert "not financial advice" in guidance
    assert "not a recommendation to buy, sell, or hold" in guidance
    assert "not financial advice" in investments

    # Generated recommendation cards and explanation drawers must carry the same warning.
    assert "informational only. not financial advice" in guidance_js
    assert guidance_js.count("disclaimer") >= 4
    assert "recommendation to buy, sell, or hold" in guidance_js

from pathlib import Path

from jinja2 import Environment


TEMPLATES_DIR = Path(__file__).resolve().parents[2] / "frontend" / "templates"


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
    assert "</body></html>" in layout

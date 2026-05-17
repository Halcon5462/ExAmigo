import sys
import os

BASE_DIR = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "../../backend")
)
sys.path.insert(0, BASE_DIR)

try:
    import django

    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend.settings")
    django.setup()
except Exception:
    pass


project = "ExAmigo"
author = "Republicans"
release = "1.0"


extensions = [
    "sphinx.ext.autodoc",
    "sphinx.ext.napoleon",
    "sphinx.ext.viewcode",
]


html_theme = "sphinx_rtd_theme"

autodoc_default_options = {
    "members": True,
    "undoc-members": True,
    "show-inheritance": True,
}

autodoc_typehints = "description"

autodoc_docstring_signature = True

autodoc_mock_imports = [
    "backend.asgi",
    "backend.wsgi",
]

suppress_warnings = [
    "toc.not_readable",
    "toc.not_included",
    "autodoc.mocked_object",
]

nitpicky = False


add_module_names = False
language = "en"

templates_path = ["_templates"]
exclude_patterns = []

html_static_path = ["_static"]
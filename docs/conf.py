import os
import sys
import django

sys.path.insert(0, os.path.abspath('../backend'))

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')

django.setup()

project = 'Exam Service API'
copyright = '2025, Твоё имя'
author = 'Твоё имя'
release = '1.0.0'

extensions = [
    'sphinx.ext.autodoc',
    'sphinx.ext.autosummary',
    'sphinx.ext.viewcode',
    'sphinx.ext.napoleon',
]

templates_path = ['_templates']
exclude_patterns = ['_build', 'Thumbs.db', '.DS_Store']

autosummary_generate = True

autodoc_default_options = {
    'members': True,
    'undoc-members': True,
    'show-inheritance': True,
    'inherited-members': True,
}

html_theme = 'sphinx_rtd_theme'
html_static_path = ['_static']

autodoc_member_order = 'bysource'
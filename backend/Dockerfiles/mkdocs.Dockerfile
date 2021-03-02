FROM python:3-slim-buster

RUN python3 -m pip install mkdocs mkdocs-material mdx_gh_links python_docs_theme

from pathlib import Path
from git import Repo
from generators import MkdocsGenerator, SphinxGenerator, DoxygenGenerator, DOXYFILE_NAME
from flask import current_app
import shutil
import logging

DATA_DIR = Path(__file__).parent.absolute() / 'data'
STATIC_DIR = Path(__file__).parent.absolute() / 'doc'
GENERATORS = {
    'mkdocs': MkdocsGenerator(),
    'sphinx': SphinxGenerator(),
    'doxygen': DoxygenGenerator()
}

DOXYGEN_GENERATOR_NAME = 'doxygen'
DEFAULT_DOXYFILE_TEMPLATE = 'doxyfile_template.txt'

def as_dir_path(base_dir, project: str, repo: str) -> Path:
    return base_dir / project / repo


def create_repo_data(project: str, repo: str, url: str):
    repo_path = as_dir_path(DATA_DIR, project, repo)

    if repo_path.exists():
        current_app.logger.warning(f'Not cloning from {url} because {repo_path} already exists')
        return

    repo_path.mkdir(parents=True, exist_ok=True)
    current_app.logger.debug(f'Cloning from {url}')
    Repo.clone_from(url, repo_path)


def update_data(project: str, repo: str):
    repo_path = as_dir_path(DATA_DIR, project, repo)
    repo = Repo(repo_path)
    repo.remote().pull()


def update_static(project: str, repo: str):
    src_path = as_dir_path(DATA_DIR, project, repo)
    dest_path = as_dir_path(STATIC_DIR, project, repo)

    did_generate = False
    for generator_name, generator in GENERATORS.items():
        if generator.check(src_path):
            dest_path.mkdir(parents=True, exist_ok=True)
            generator.generate(src_path, dest_path / generator_name)
            did_generate = True

    if not did_generate:
        # Generate a default doxygen doxyfile and do stuff
        logging.info(f"Project '{project}' has no docs to be generated, creating default Doxygen docs.")
        shutil.copy(DEFAULT_DOXYFILE_TEMPLATE, src_path / DOXYFILE_NAME)
        doxygen = DoxygenGenerator()
        dest_path.mkdir(parents=True, exist_ok=True)
        (dest_path / DOXYGEN_GENERATOR_NAME).mkdir(parents=True, exist_ok=True)
        assert doxygen.check(src_path), 'Something has gone really bad'
        doxygen.generate(src_path, dest_path / DOXYGEN_GENERATOR_NAME)

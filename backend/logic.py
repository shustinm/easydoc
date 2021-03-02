from pathlib import Path
from git import Repo
from generators import GENERATORS
from flask import current_app
import shutil
import logging
import os
import docker

BACKEND_ROOT = Path(__file__).parent.absolute()
DATA_DIR = BACKEND_ROOT / 'data'
STATIC_DIR = BACKEND_ROOT / 'doc'

running_containers = {}

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
    docker_src_path = Path('/app') / 'data' / project / repo
    docker_dest_path = Path('/app') / 'doc' / project/ repo

    docker_client = docker.client.from_env()

    for generator_name, generator in GENERATORS.items():
        if (generator := generator()).check(src_path):

            # Image is not yet running
            if (img := generator.docker_image()) not in running_containers:
                volumes = {os.environ['BACKEND_ROOT']: {'bind': '/app', 'mode': 'rw'}}
                container = docker_client.containers.run(img, detach=True, volumes=volumes, working_dir='/app', stdin_open=True)
                running_containers[img] = container

            dest_path.mkdir(parents=True, exist_ok=True)
            exit_status, output = running_containers[img].exec_run(
                f'python3 generators.py {generator_name} {docker_src_path} {docker_dest_path}',
                workdir='/app'
            )
            current_app.logger.info(output.decode())

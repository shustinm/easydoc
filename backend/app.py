import logging
from http import HTTPStatus
from typing import Tuple
from flask import Flask, request, jsonify
import flask_cors
import re

from logic import (
    create_repo_data, update_data, update_static, STATIC_DIR
)

app = Flask(__name__, static_folder='doc')
logger: logging.Logger = app.logger

logger.setLevel(logging.DEBUG)


@app.route('/')
def hello_world():
    return 'Hello World!'


def parse_url(url: str) -> Tuple[str, str]:
    """
    Parses a git clone URL to derive project and repo
    :param url: clone URL
    :return: tuple of repo project string and repo string
    """
    if not url.startswith('git@'):
        raise ValueError(f'{url} is not a valid git URL')

    match = re.match(r"git@(.+):(?P<project>.+)/(?P<repo>.+).git", url)\
        .groupdict()

    logger.debug(f'Git URL info: '
                 f'project={match["project"]}, repo={match["repo"]}')

    return match['project'], match['repo']


@app.route('/api/create', methods=['POST'])
@flask_cors.cross_origin()
def create():
    url = request.args.get('url')

    if not url:
        return 'No URL was given', HTTPStatus.BAD_REQUEST

    try:
        project, repo = parse_url(url)
    except ValueError as e:
        return str(e), HTTPStatus.BAD_REQUEST

    create_repo_data(project, repo, url)
    update_static(project, repo)

    return 'OK!', HTTPStatus.OK


@app.route('/api/search', methods=['GET'])
@flask_cors.cross_origin()
def search():
    query = request.args.get('query')

    if not query:
        return jsonify(dict())

    # Match project/repo/type
    items = [str(d) for d in STATIC_DIR.glob("*/*/*") if d.is_dir()]

    # Change repo/type to repo:type
    items = list(map(lambda x: ':'.join(x.rsplit('/', 1)), items))

    reg = re.compile(".*" + query + ".*", re.IGNORECASE)

    return jsonify([i[len('/app/doc/'):] for i in items if reg.match(i)])


@app.route('/<string:project>/<string:repo>/')
@app.route('/<string:project>/<string:repo>/<path:subpath>')
def route(project, repo, subpath=''):
    path = f'{project}/{repo}/{subpath}'
    if path.endswith('/'):
        path += "index.html"

    return app.send_static_file(path)


@app.route('/api/update', methods=['POST'])
def update():
    data = request.get_json()
    project = data['repository']['project']
    repo = data['repository']['name']
    update_data(project, repo)


@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS')
    return response


if __name__ == '__main__':
    cors = flask_cors.CORS(app, resources={r"/static/*": {"origins": "*"}})
    app.config['CORS_HEADERS'] = 'Content-Type'
    app.run(host="0.0.0.0", debug=True)

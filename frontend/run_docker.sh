#!/bin/sh

docker run -it --rm -v ${PWD}:/app -v /app/node_modules -p 80:3000 -e CHOKIDAR_USEPOLLING=true easydoc:dev
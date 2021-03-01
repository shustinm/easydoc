#!/bin/bash

docker run -it --rm -v ${PWD}:/app -p 5000:5000 -v ${HOME}/.ssh:/root/.ssh backend:dev
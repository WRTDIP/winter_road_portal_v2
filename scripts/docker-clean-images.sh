#!/bin/bash

# Clean up dangling images
docker image rm $(docker images -q)
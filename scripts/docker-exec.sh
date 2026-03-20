#!/bin/bash

# Load environment variables from .env file
if [ -f .env ]; then
    source .env
else
    echo "Error: .env file not found"
    exit 1
fi

# Now you can use variables from .env
echo "Variables loaded from .env"

#Docker Exec

if [ -n "$1" ]; then

    shlist=("ui")

    for item in "${shlist[@]}"; do
        if [ "$1" == "$item" ]; then
            docker exec -it ${item}_${DEPLOY_MODE} sh
            exit
        fi
    done

    docker exec -it $1_${DEPLOY_MODE} bash
    exit
fi

docker exec -it ui_${DEPLOY_MODE} bash

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

if [ -n $1 ]; then
    docker logs -f $1_${DEPLOY_MODE}

    exit
fi

docker compose --env-file .env -f docker-compose.${DEPLOY_MODE}.yml logs -f
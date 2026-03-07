include .env

start:
	./scripts/docker-start.sh

stop:
	./scripts/docker-stop.sh

restart: stop start

logs:
	./scripts/docker-logs.sh

logs-api:
	./scripts/docker-logs.sh api

logs-db:
	./scripts/docker-logs.sh db

logs-ui:
	./scripts/docker-logs.sh ui
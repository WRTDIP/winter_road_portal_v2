include .env

start:
	./scripts/docker-start.sh

start-ui:
	./scripts/docker-start.sh ui

start-api:
	./scripts/docker-start.sh api

start-db:
	./scripts/docker-start.sh db

stop:
	./scripts/docker-stop.sh

stop-ui:
	./scripts/docker-stop.sh ui

stop-api:
	./scripts/docker-stop.sh api

stop-db:
	./scripts/docker-stop.sh db

restart: stop start

exec:
	./scripts/docker-exec.sh

exec-ui:
	./scripts/docker-exec.sh ui

exec-api:
	./scripts/docker-exec.sh api

exec-db:
	./scripts/docker-exec.sh db

logs:
	./scripts/docker-logs.sh

logs-ui:
	./scripts/docker-logs.sh ui

logs-api:
	./scripts/docker-logs.sh api

logs-db:
	./scripts/docker-logs.sh db

clean-all:
	./scripts/docker-clean-all.sh

clean:
	./scripts/docker-clean.sh
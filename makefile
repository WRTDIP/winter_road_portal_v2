include .env

start:
	./scripts/docker-start.sh

start-build:
	./scripts/docker-start-build.sh

start-ui:
	./scripts/docker-start.sh ui

start-api:
	./scripts/docker-start.sh api

start-db:
	./scripts/docker-start.sh db

start-apache:
	./scripts/docker-start.sh apache

start-python-api:
	./scripts/docker-start.sh python-api

stop:
	./scripts/docker-stop.sh

stop-ui:
	./scripts/docker-stop.sh ui

stop-api:
	./scripts/docker-stop.sh api

stop-db:
	./scripts/docker-stop.sh db

stop-apache:
	./scripts/docker-stop.sh apache

stop-python-api:
	./scripts/docker-stop.sh python-api

restart: stop start

restart-ui: stop-ui start-ui

restart-api: stop-api start-api

restart-db: stop-db start-db

restart-apache: stop-apache start-apache

restart-python-api: stop-python-api start-python-api

exec:
	./scripts/docker-exec.sh

exec-ui:
	./scripts/docker-exec.sh ui

exec-api:
	./scripts/docker-exec.sh api

exec-db:
	./scripts/docker-exec.sh db

exec-apache:
	./scripts/docker-exec.sh apache

exec-python-api:
	./scripts/docker-exec.sh python-api

build:
	./scripts/docker-build.sh

build-ui:
	./scripts/docker-build.sh ui

build-api:
	./scripts/docker-build.sh api

build-db:
	./scripts/docker-build.sh db

build-apache:
	./scripts/docker-build.sh apache

build-python-api:
	./scripts/docker-build.sh python-api

logs:
	./scripts/docker-logs.sh

logs-ui:
	./scripts/docker-logs.sh ui

logs-api:
	./scripts/docker-logs.sh api

logs-db:
	./scripts/docker-logs.sh db

logs-apache:
	./scripts/docker-logs.sh apache

logs-python-api:
	./scripts/docker-logs.sh python-api

clean-all:
	./scripts/docker-clean-all.sh

clean:
	./scripts/docker-clean.sh

clean-images:
	./scripts/docker-clean-images.sh

status:
	./scripts/docker-status.sh
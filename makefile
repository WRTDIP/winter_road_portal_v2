include .env

start:
	./scripts/docker-start.sh

stop:
	./scripts/docker-stop.sh

restart: stop start

logs:
	./scripts/docker-logs.sh
migration:
	npm run build
	npm run migration:run

docker-connect:
	docker-compose up -d

list-container:
	docker container ps -a

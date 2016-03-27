docker rm -f og-service
docker rm -f web-app
docker network rm simple-network
docker network create simple-network
docker run --name og-service --net simple-network -dit og-service
docker run --name web-app --net simple-network -it web-app bash
